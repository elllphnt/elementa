export function appearanceActivatorToText(activator: AppearanceActivatorData) {
  switch (activator.type) {
    case "state": {
      const appearanceStateActivator =
        activator as AppearanceStateActivatorData;
      return `State: ${appearanceStateActivator.state ?? "unset"}`;
    }
    case "expression": {
      const appearanceExpressionActivator =
        activator as AppearanceExpressionActivatorData;
      return `Exp.: ${appearanceExpressionActivator.expression ?? "unset"}`;
    }
  }
}
