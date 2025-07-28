import axios from "axios";
import * as XLSX from "xlsx";
import type { TDocumentDefinitions, Content } from "pdfmake/interfaces";
import type { Params, ExportStats } from "@/types";
import logoModule from "../app/favicon.ico";

export const handleExport = async ({
  token,
  selectedKeys,
  exportFormat,
  exportProgress,
  setExportStats,
  setExportProgress,
  addToast,
  setStep,
  setLoading,
}: Params) => {
  if (selectedKeys.length === 0) {
    addToast({
      title: "Selecione pelo menos um projeto",
      text: "Você precisa escolher ao menos um projeto para exportar",
      color: "warning",
      iconType: "alert",
    });
    return;
  }

  setStep("exporting");
  setLoading(true);
  setExportProgress(0);

  try {
    const progressInterval = setInterval(() => {
      setExportProgress(exportProgress + 10);
    }, 300);

    const res = await axios.post("/api/sonar-issues", { token, selectedKeys });
    if (res.status !== 200) throw new Error("Erro ao exportar issues");

    clearInterval(progressInterval);
    setExportProgress(100);

    const issues = res.data.issues;

    const stats: ExportStats = {
      totalIssues: issues.length,
      projectCount: selectedKeys.length,
      severityBreakdown: issues.reduce((acc: any, issue: any) => {
        const severity = issue.severity ?? "UNKNOWN";
        acc[severity] = (acc[severity] ?? 0) + 1;
        return acc;
      }, {}),
    };
    setExportStats(stats);

    const filename = `sonar-report-${new Date().toISOString().split("T")[0]}`;
    const blobDownload = (blob: Blob, ext: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    if (exportFormat === "json") {
      const json = JSON.stringify(issues, null, 2);
      blobDownload(new Blob([json], { type: "application/json" }), "json");
    } else if (exportFormat === "csv") {
      const grouped: Record<string, any[]> = issues.reduce((acc: any, issue: any) => {
        const key = issue.project ?? "SemProjeto";
        acc[key] ??= [];
        acc[key].push(issue);
        return acc;
      }, {});

      const wb = XLSX.utils.book_new();
      const sheetNames = new Set<string>();

      Object.entries(grouped).forEach(([projectKey, data]) => {
        const sheet = XLSX.utils.json_to_sheet(data);
        let name = projectKey.replace(/[:\\/?*[\]]/g, "").slice(0, 31);
        const base = name;
        let count = 1;
        while (sheetNames.has(name)) {
          const suffix = `_${count++}`;
          name = `${base.slice(0, 31 - suffix.length)}${suffix}`;
        }
        sheetNames.add(name);
        XLSX.utils.book_append_sheet(wb, sheet, name);
      });

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      blobDownload(
        new Blob([wbout], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        "xlsx"
      );
    } else if (exportFormat === "pdf") {
      const pdfMake = (await import("pdfmake/build/pdfmake")).default;
      const pdfFonts = await import("pdfmake/build/vfs_fonts");
      pdfMake.vfs = pdfFonts.vfs;

      const colors = {
        primary: "#089c3b",
        success: "#3da751",
        accent: "#5bb366",
        warning: "#ffc107",
        accentSecondary: "#17a2b8",
        danger: "#dc3545",
        text: "#141414",
        textSubdued: "#666666",
        textDisabled: "#aaaaaa",
        background: "#ffffff",
        backgroundSubdued: "#f5f5f5",
        backgroundLight: "#fafafa",
        border: "#cccccc",
        borderSubdued: "#e0e0e0",
        borderAccent: "#dddddd",
        shadow: "rgba(0, 0, 0, 0.1)",
        white: "#ffffff",
        headerGradient: "#f8fcf9",
      };

      const loadLogoAsBase64 = async (): Promise<string> => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          return new Promise((resolve) => {
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/png"));
            };
            img.src = typeof logoModule === "string" ? logoModule : logoModule.src;
          });
        } catch (error) {
          console.warn("Erro ao carregar logo, usando placeholder:", error);
          return (
            "data:image/svg+xml;base64," +
            btoa(`
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="60" rx="8" fill="#089c3b"/>
          <text x="30" y="40" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">L</text>
        </svg>
      `)
          );
        }
      };

      const logoBase64 = await loadLogoAsBase64();

      const header: Content[] = [
        {
          columns: [
            {
              image: logoBase64,
              width: 60,
              height: 60,
              margin: [0, 0, 20, 10],
            },
            {
              stack: [
                {
                  text: "Fonteeboa - " + document.title,
                  style: "companyName",
                  color: colors.primary,
                  margin: [15, 0, 0, 0],
                },
                {
                  text: "Relatório de Análise - SonarQube",
                  style: "header",
                  color: colors.text,
                  margin: [15, 5, 0, 0],
                },
                {
                  text: "Análise de Qualidade de Código",
                  style: "subtitle",
                  color: colors.textSubdued,
                  margin: [15, 2, 0, 0],
                },
              ],
              width: "*",
            },
            {
              stack: [
                {
                  text: `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
                  style: "dateInfo",
                  alignment: "right",
                },
                {
                  text: `${new Date().toLocaleTimeString("pt-BR")}`,
                  style: "timeInfo",
                  alignment: "right",
                },
              ],
              width: "auto",
            },
          ],
          margin: [0, 0, 0, 30],
        },
        {
          canvas: [
            {
              type: "rect",
              x: 0,
              y: 0,
              w: 515,
              h: 3,
              color: colors.primary,
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          table: {
            widths: ["*", "*", "*", "*"],
            body: [
              [
                { text: "Total de Issues", style: "summaryLabel" },
                { text: "Críticos", style: "summaryLabel" },
                { text: "Principais", style: "summaryLabel" },
                { text: "Menores", style: "summaryLabel" },
              ],
              [
                { text: issues.length.toString(), style: "summaryValue", color: colors.primary },
                {
                  text: issues.filter((i: any) => i.severity === "CRITICAL").length.toString(),
                  style: "summaryValue",
                  color: colors.danger,
                },
                {
                  text: issues.filter((i: any) => i.severity === "MAJOR").length.toString(),
                  style: "summaryValue",
                  color: colors.warning,
                },
                {
                  text: issues.filter((i: any) => i.severity === "MINOR").length.toString(),
                  style: "summaryValue",
                  color: colors.success,
                },
              ],
            ],
          },
          layout: {
            fillColor: (i: number) => (i === 0 ? colors.primary : colors.white),
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => colors.border,
            vLineColor: () => colors.border,
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
          margin: [0, 0, 0, 25],
        },
      ];

      const getSeverityColor = (severity: string) => {
        switch (severity?.toUpperCase()) {
          case "CRITICAL":
            return colors.danger;
          case "MAJOR":
            return colors.warning;
          case "MINOR":
            return colors.success;
          case "INFO":
            return colors.primary;
          default:
            return colors.text;
        }
      };

      const tableBody = [
        ["Projeto", "Tipo", "Severidade", "Mensagem", "Componente"].map((text) => ({
          text,
          style: "tableHeader",
        })),
        ...issues.slice(0, 1000).map((i: any, index: number) => [
          { text: i.project ?? "-", style: "tableCell" },
          { text: i.type ?? "-", style: "tableCell" },
          {
            text: i.severity ?? "-",
            style: "severityCell",
            color: getSeverityColor(i.severity),
            bold: true,
          },
          { text: i.message ?? "-", style: "wrapCell" },
          { text: i.component ?? "-", style: "tableCell" },
        ]),
      ];

      if (issues.length > 1000) {
        tableBody.push([
          {
            text: `... e mais ${issues.length - 1000} issues encontrados`,
            colSpan: 5,
            style: "moreIssues",
            alignment: "center",
            color: colors.text,
          },
          {},
          {},
          {},
          {},
        ]);
      }

      const docDefinition: TDocumentDefinitions = {
        content: [
          ...header,
          {
            text: "Detalhamento dos Issues",
            style: "sectionHeader",
            color: colors.primary,
            margin: [0, 0, 0, 15],
          },
          {
            table: {
              headerRows: 1,
              widths: ["auto", "auto", "auto", "*", "*"],
              body: tableBody,
            },
            layout: {
              fillColor: (i: number) => {
                if (i === 0) return colors.primary;
                if (i % 2 === 0) return colors.backgroundSubdued;
                return colors.background;
              },
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => colors.border,
              vLineColor: () => colors.border,
              paddingLeft: () => 6,
              paddingRight: () => 6,
              paddingTop: () => 4,
              paddingBottom: () => 4,
            },
          },
        ],

        styles: {
          companyName: {
            fontSize: 16,
            bold: true,
            margin: [0, 0, 0, 2],
          },
          header: {
            fontSize: 20,
            bold: true,
          },
          subtitle: {
            fontSize: 12,
            italics: true,
          },
          dateInfo: {
            fontSize: 10,
            color: colors.text,
            margin: [0, 0, 0, 2],
          },
          timeInfo: {
            fontSize: 9,
            color: colors.text,
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            margin: [0, 20, 0, 10],
          },
          summaryLabel: {
            fontSize: 10,
            bold: true,
            alignment: "center",
            color: colors.text,
          },
          summaryValue: {
            fontSize: 14,
            bold: true,
            alignment: "center",
          },
          tableHeader: {
            bold: true,
            fontSize: 11,
            color: colors.white,
            alignment: "center",
          },
          tableCell: {
            fontSize: 9,
            margin: [0, 2, 0, 2],
            color: colors.text,
          },
          severityCell: {
            fontSize: 9,
            margin: [0, 2, 0, 2],
            alignment: "center",
          },
          wrapCell: {
            fontSize: 8,
            margin: [0, 2, 0, 2],
            color: colors.text,
          },
          moreIssues: {
            italics: true,
            fontSize: 10,
            margin: [0, 10, 0, 0],
            color: colors.textSubdued,
          },
        },

        defaultStyle: {
          fontSize: 10,
          color: colors.text,
          font: "Roboto",
        },

        pageMargins: [40, 60, 40, 60],

        footer: (currentPage: number, pageCount: number) => ({
          columns: [
            {
              text: "SUA EMPRESA - Relatório SonarQube",
              fontSize: 8,
              color: colors.textSubdued,
              margin: [40, 0, 0, 0],
            },
            {
              text: `Página ${currentPage} de ${pageCount}`,
              fontSize: 8,
              color: colors.textSubdued,
              alignment: "right",
              margin: [0, 0, 40, 0],
            },
          ],
          margin: [0, 10, 0, 0],
        }),

        info: {
          title: "Relatório SonarQube - Análise de Qualidade",
          author: "Fonteeboa",
          subject: "Relatório de análise de código",
          creator: "Sistema de Análise de Qualidade",
          producer: "pdfmake",
        },
      };

      pdfMake.createPdf(docDefinition).download(`${filename}.pdf`);
    }
    addToast({
      title: "Download concluído! 📊",
      text: "Seu relatório foi baixado com sucesso",
      color: "success",
      iconType: "download",
    });
    setStep("done");
  } catch (e) {
    console.error("Erro ao exportar issues:", e);
    addToast({
      title: "Erro na exportação 😞",
      text: "Algo deu errado durante a exportação. Tente novamente.",
      color: "danger",
      iconType: "alert",
    });
    setStep("list");
  } finally {
    setLoading(false);
  }
};
