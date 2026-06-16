import * as vscode from 'vscode';
import { TraceLMPanel } from './panels/TraceLMPanel';

export function activate(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand('tracelm.open', () => {
    TraceLMPanel.createOrShow(context);
  });

  context.subscriptions.push(disposable);
}

export function deactivate(): void {
  // No cleanup required for this scaffold phase.
}
