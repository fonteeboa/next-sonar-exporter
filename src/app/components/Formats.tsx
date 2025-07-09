"use client";

import React from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiButton,
  EuiIcon,
  EuiText,
  EuiSpacer,
  EuiBadge,
  useEuiTheme,
  useIsWithinBreakpoints,
  EuiCard,
} from "@elastic/eui";
import { getThemeStyles } from "@/styles/themeStyles";

type ExportFormats = "json" | "csv" | "pdf";

const Formats: React.FC<any> = ({ selectedKeys, loading, handleExport, exportFormat, setExportFormat }) => {
  const { euiTheme } = useEuiTheme();
  const themeStyles = getThemeStyles(euiTheme);
  const isMobile = useIsWithinBreakpoints(["xs", "s"]);

  const cards = [
    {
      format: "json",
      title: "JSON",
      icon: "code",
      description: "Ideal para integrações com sistemas externos, APIs e automações.",
      badges: ["APIs", "Automação"],
    },
    {
      format: "csv",
      title: "Excel",
      icon: "visTable",
      description: "Planilha .xlsx gerada com abas por projeto, ideal para relatórios técnicos.",
      badges: ["Dashboard", "Análise"],
    },
    {
      format: "pdf",
      title: "PDF",
      icon: "document",
      description: "Gera um relatório visual pronto para apresentações e uso executivo.",
      badges: ["Executivo", "Apresentação"],
    },
  ];

  const selectedCard = cards.find((c) => c.format === exportFormat);

  return (
    <>
      <EuiTitle size="m">
        <h2 style={{ display: "flex", alignItems: "center" }}>
          <EuiIcon type="exportAction" size="l" style={{ marginRight: 8 }} />
          Escolha o Formato de Exportação
        </h2>
      </EuiTitle>

      <EuiText size="s" color="subdued">
        <p>Selecione o tipo de relatório que deseja gerar para os projetos escolhidos.</p>
      </EuiText>

      <EuiSpacer size="l" />

      <EuiFlexGroup gutterSize="l" direction={isMobile ? "column" : "row"} wrap responsive>
        {cards.map(({ format, title, icon, description, badges }) => (
          <EuiFlexItem key={format}>
            <EuiCard
              icon={
                <div
                  style={{
                    ...themeStyles.iconBox,
                    background:
                      exportFormat === format ? themeStyles.iconBox.selectedBg : themeStyles.iconBox.backgroundColor,
                  }}
                >
                  <EuiIcon type={icon} size="xl" color={exportFormat === format ? "white" : "subdued"} />
                </div>
              }
              title={title}
              selectable={{
                onClick: () => setExportFormat(format as ExportFormats),
                isSelected: exportFormat === format,
                children: exportFormat === format ? "Selecionado" : "Selecionar",
              }}
              footer={
                <EuiFlexGroup gutterSize="xs" wrap responsive={false}>
                  {badges.map((text) => (
                    <EuiFlexItem key={text} grow={false}>
                      <EuiBadge color="hollow" style={{ ...themeStyles.badge, fontSize: 10 }}>
                        {text}
                      </EuiBadge>
                    </EuiFlexItem>
                  ))}
                </EuiFlexGroup>
              }
              paddingSize="l"
              style={{
                ...themeStyles.cardExport,
                border:
                  exportFormat === format
                    ? `3px solid ${euiTheme.colors.primary}`
                    : `1px solid ${euiTheme.colors.textAccent}`,
                boxShadow:
                  exportFormat === format ? "0 6px 24pxrgb(0, 107, 180, 0.25)" : themeStyles.cardExport.boxShadow,
              }}
            />
          </EuiFlexItem>
        ))}
      </EuiFlexGroup>

      <EuiSpacer size="m" />

      {selectedCard && (
        <EuiText size="s" color="subdued" textAlign="center">
          <p style={{ textAlign: "center", marginBottom: 0 }}>{selectedCard.description}</p>
        </EuiText>
      )}

      <EuiSpacer size="xl" />

      <EuiButton
        onClick={handleExport}
        fill
        iconType="exportAction"
        size="m"
        fullWidth
        style={themeStyles.button}
        isLoading={loading}
        disabled={loading ?? selectedKeys.length === 0}
      >
        {loading ? "Exportando..." : "Exportar Relatório"}
      </EuiButton>
    </>
  );
};

export default Formats;
