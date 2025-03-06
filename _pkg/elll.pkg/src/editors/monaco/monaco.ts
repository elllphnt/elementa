import { Monaco } from "@monaco-editor/loader";
import { Shell } from "@repo/shell";
import * as monaco from "monaco-editor";
import { BehaviorSubject } from "rxjs";
import { getMonaco } from "~/src/libs/monaco";
import { ModelEditorState, ModelEditorStateData } from "../model";

export type MonacoEditorStateData = ModelEditorStateData & {};

export abstract class MonacoEditorState<
  D extends MonacoEditorStateData,
> extends ModelEditorState<D> {
  private _textModel$ = new BehaviorSubject<
    monaco.editor.ITextModel | undefined
  >(undefined);

  get textModel() {
    return this._textModel$.value;
  }
  get textModel$() {
    return this._textModel$.asObservable();
  }

  constructor({
    id,
    shell,
    editorId,
  }: {
    id?: string;
    shell: Shell;
    editorId: string;
  }) {
    super({ id, editorId, shell });
  }

  async init({
    uri,
    content,
    language,
  }: {
    uri: string;
    content: string;
    language: string;
  }) {
    const monaco = await getMonaco();
    const model = this.getOrCreateModel(
      monaco,
      content,
      language,
      monaco.Uri.parse(uri),
    );
    this._textModel$.next(model);
  }

  getOrCreateModel(
    monaco: Monaco,
    content: string,
    language: string,
    uri: monaco.Uri,
  ) {
    let model = monaco.editor.getModel(uri);
    if (!model) {
      model = monaco.editor.createModel(content, language, uri);
    }
    return model;
  }

  abstract saveContent(content: string): Promise<void> | void;
  abstract formatContent(content: string): Promise<string> | string;
  async save() {
    const model = this.textModel;
    if (!model) return;

    this.saveContent(model.getValue());
  }
  async format() {
    const model = this.textModel;
    if (!model) return;

    const newValue = await this.formatContent(model.getValue());
    model.setValue(newValue);
  }
}
