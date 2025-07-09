"use client";

import React, { useState } from "react";
import {
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiButton,
  EuiFieldText,
  EuiFieldPassword,
  EuiPopover,
  EuiCode,
  EuiIcon,
  EuiText,
  EuiSpacer,
  EuiFormRow,
  useEuiTheme,
} from "@elastic/eui";
import { getThemeStyles } from "@/styles/themeStyles";

const Auth: React.FC<any> = ({ fetchProjects, loading, orgKey, setOrgKey, setToken, token }) => {
  const [isHelpPopoverOpen, setIsHelpPopoverOpen] = useState(false);
  const { euiTheme } = useEuiTheme();
  const themeStyles = getThemeStyles(euiTheme);
  const [isOrgFocused, setIsOrgFocused] = useState(false);
  const [isTokenFocused, setIsTokenFocused] = useState(false);

  return (
    <EuiForm component="form" style={themeStyles.form}>
      <EuiFlexGroup direction="column" alignItems="center" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiIcon type="lock" size="xl" color={themeStyles.icons.color} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiTitle size="m">
            <h2 style={themeStyles.titleCenter}>Conecte-se ao SonarQube</h2>
          </EuiTitle>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="xl" />

      <EuiFormRow label="Organização" helpText="Informe a chave da organização no SonarQube" fullWidth>
        <EuiFieldText
          value={orgKey}
          onChange={(e) => setOrgKey(e.target.value)}
          placeholder="ex: minha-empresa"
          fullWidth
          style={{
            ...themeStyles.fieldInput,
            ...(isOrgFocused ? themeStyles.fieldInputFocus : {}),
          }}
          onFocus={() => setIsOrgFocused(true)}
          onBlur={() => setIsOrgFocused(false)}
        />
      </EuiFormRow>

      <EuiFormRow label="Token de Autenticação" helpText="Token pessoal gerado em sua conta no SonarQube" fullWidth> 
        <EuiFieldPassword
          value={token}
          type="dual"
          onChange={(e) => setToken(e.target.value)}
          placeholder="squ_..."
          fullWidth
          style={{
            ...themeStyles.fieldInput,
            ...(isTokenFocused ? themeStyles.fieldInputFocus : {}),
          }}
          onFocus={() => setIsTokenFocused(true)}
          onBlur={() => setIsTokenFocused(false)}
        />
      </EuiFormRow>

      <EuiSpacer size="m" />

      <EuiFlexGroup direction="columnReverse" alignItems="stretch" gutterSize="s">
        <EuiFlexItem grow={false}>
          <EuiButton
            style={themeStyles.button}
            onClick={fetchProjects}
            isLoading={loading}
            fill
            iconType="arrowRight"
            fullWidth
          >
            {loading ? "Conectando..." : "Conectar ao SonarQube"}
          </EuiButton>
        </EuiFlexItem>

        <EuiFlexItem grow={false}>
          <EuiPopover
            button={
              <EuiButton
                iconType="questionInCircle"
                style={themeStyles.buttonSecondary}
                color="primary"
                size="s"
                onClick={() => setIsHelpPopoverOpen(!isHelpPopoverOpen)}
                fullWidth
              >
                Como obter seu token?
              </EuiButton>
            }
            isOpen={isHelpPopoverOpen}
            closePopover={() => setIsHelpPopoverOpen(false)}
          >
            <div style={themeStyles.popover}>
              <EuiText size="s">
                <h4>Passos para gerar o token:</h4>
                <ol style={{ paddingLeft: 16 }}>
                  <li>Acesse seu SonarQube</li>
                  <li>
                    Vá em <EuiCode>My Account → Security</EuiCode>
                  </li>
                  <li>Gere um novo token</li>
                  <li>Cole no campo acima</li>
                </ol>
                <EuiSpacer size="s" />
                <p>
                  <EuiIcon type="lock" size="s" /> Seu token não será armazenado.
                </p>
              </EuiText>
            </div>
          </EuiPopover>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiForm>
  );
};

export default Auth;
