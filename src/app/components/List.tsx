"use client";

import React, { useState } from "react";
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiButton,
  EuiCode,
  EuiIcon,
  EuiText,
  EuiSpacer,
  EuiBadge,
  useEuiTheme,
  EuiFieldSearch,
  EuiBasicTable,
  EuiPanel,
} from "@elastic/eui";
import { getThemeStyles } from "@/styles/themeStyles";

const List: React.FC<any> = ({ selectedKeys, setStep, setSelectedKeys, projects }) => {
  const { euiTheme } = useEuiTheme();
  const themeStyles = getThemeStyles(euiTheme);
  const [tableKey, setTableKey] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const filteredProjects = projects.filter((p: any) => p.name.toLowerCase().includes(searchValue.toLowerCase()));

  const handleSelectionChange = (selectedItems: any[]) => {
    setSelectedKeys(selectedItems);
    setTableKey((prevKey) => prevKey + 1);
  };

  return (
    <EuiPanel hasShadow={false} style={themeStyles.card}>
      <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" wrap>
        <EuiFlexItem>
          <EuiTitle size="m">
            <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <EuiIcon type="indexMapping" size="l" />
              Projetos disponíveis
            </h2>
          </EuiTitle>
          <EuiText size="s" color="subdued">
            <p style={{ margin: 0 }}>Selecione os projetos que deseja incluir no relatório de segurança e qualidade.</p>
          </EuiText>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiBadge style={themeStyles.badge}>
            {selectedKeys.length} de {projects.length} selecionados
          </EuiBadge>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="m" />

      <EuiFieldSearch
        placeholder="Filtrar por nome do projeto..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        fullWidth
        isClearable
        compressed
      />

      <EuiSpacer size="m" />

      <EuiBasicTable
        items={filteredProjects}
        columns={[
          {
            field: "name",
            name: "",
            render: (name: string) => (
              <EuiText size="s">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <EuiIcon type="logoGithub" size="m" color="text" />
                  <EuiCode>{name}</EuiCode>
                </div>
              </EuiText>
            ),
          },
        ]}
        selection={{
          selectable: () => true,
          initialSelected: projects.filter((p: any) => selectedKeys.includes(p.key)),
          onSelectionChange: (selectedItems: any[]) => {
            setSelectedKeys(selectedItems.map((p) => p.key));
          },
        }}
        key={tableKey}
        itemId="key"
        responsiveBreakpoint={true}
        tableLayout="auto"
        noItemsMessage="Nenhum projeto encontrado."
        style={themeStyles.table}
        rowProps={() => ({
          className: "euiTableRow--striped",
        })}
      />

      <EuiSpacer size="m" />

      <EuiFlexGroup gutterSize="s" justifyContent="flexEnd" wrap>
        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={() => handleSelectionChange(projects.map((p: any) => p.key))}
            size="s"
            iconType="check"
            style={themeStyles.buttonThirdy}
          >
            Selecionar Todos
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={() => handleSelectionChange([])}
            size="s"
            color="danger"
            iconType="cross"
            style={themeStyles.buttonDelete}
          >
            Limpar
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            onClick={() => setStep("formats")}
            fill
            iconType="arrowRight"
            style={themeStyles.button}
            size="s"
            color="primary"
            isDisabled={selectedKeys.length === 0}
          >
            Continuar
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};

export default List;
