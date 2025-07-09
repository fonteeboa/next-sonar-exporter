"use client";

import React from "react";
import { EuiFlexGroup, EuiFlexItem, EuiTitle, EuiText, EuiLoadingSpinner, EuiProgress } from "@elastic/eui";

const Exporting: React.FC<any> = ({ exportProgress }) => {
  return (
    <EuiFlexGroup direction="column" alignItems="center" gutterSize="m">
      <EuiFlexItem grow={false}>
        <EuiLoadingSpinner size="xl" />
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiTitle size="m">
          <h2>Gerando seu relatório...</h2>
        </EuiTitle>
        <EuiText color="subdued" size="s">
          <p>
            Estamos processando os dados do SonarQube. Este processo pode levar alguns minutos dependendo da
            complexidade dos projetos.
          </p>
        </EuiText>
      </EuiFlexItem>

      <EuiFlexItem grow={false} style={{ width: "100%" }}>
        <EuiProgress value={exportProgress} max={100} color="accent" label />
      </EuiFlexItem>

      <EuiFlexItem grow={false}>
        <EuiText size="xs" color="subdued">
          <p>
            Não feche esta aba até a conclusão da exportação. Você será notificado quando o download estiver pronto.
          </p>
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
export default Exporting;
