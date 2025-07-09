import axios from "axios";
import * as XLSX from "xlsx";
import type { TDocumentDefinitions, Content } from "pdfmake/interfaces";
import type { Params, ExportStats } from "@/types";

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

      const header: Content[] = [
        { text: "Relatório de Análise - SonarQube", style: "header", alignment: "center", margin: [0, 0, 0, 20] },
        {
          text: `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
          style: "subheader",
          alignment: "center",
          margin: [0, 0, 0, 30],
        },
      ];

      const tableBody = [
        ["Projeto", "Tipo", "Severidade", "Mensagem", "Componente"].map((text) => ({ text, style: "tableHeader" })),
        ...issues
          .slice(0, 1000)
          .map((i: any) => [
            i.project ?? "-",
            i.type ?? "-",
            i.severity ?? "-",
            { text: i.message ?? "-", style: "wrapCell" },
            i.component ?? "-",
          ]),
      ];

      if (issues.length > 1000) {
        tableBody.push([
          { text: `... e mais ${issues.length - 1000} issues`, colSpan: 5, style: "moreIssues", alignment: "center" },
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
            table: { headerRows: 1, widths: ["auto", "auto", "auto", "*", "*"], body: tableBody },
            layout: {
              fillColor: (i) => {
                if (i === 0) return "#2c3e50";
                if (i % 2 === 0) return "#f8f9fa";
                return null;
              },

              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => "#ccc",
              vLineColor: () => "#ccc",
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true },
          subheader: { fontSize: 12, margin: [0, 4, 0, 10], color: "#444" },
          tableHeader: { bold: true, fontSize: 11, color: "white", fillColor: "#2c3e50", alignment: "center" },
          wrapCell: { fontSize: 9, margin: [0, 2, 0, 2] },
          moreIssues: { italics: true, fontSize: 10, color: "#999" },
        },
        defaultStyle: { fontSize: 10 },
        pageMargins: [40, 60, 40, 40],
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
