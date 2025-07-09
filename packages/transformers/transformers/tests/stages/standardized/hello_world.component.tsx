export enum FileType {
  Component,
  Style = "style",
  Script = "script",
  Image = "image",
  Video = "video",
  Audio = "audio",
  Font = "font",
}

export interface BodyType {
  type: FileType.Component;
  content: string;
}

export type HelloWorldProps = {
  name: string;
  body: BodyType;
};

function HelloWorld(props: HelloWorldProps) {
  return (
    <div className="card">
      <div className="title">Hello World!</div>
      <div className="content">This is a simple component.</div>
    </div>
  );
}

export const css = `
  .card {
    color: red;
  }
  .title {
    font-size: 20px;
    font-weight: bold;
  }
  .content {
    font-size: 16px;
    color: gray;
  }
`;

export default HelloWorld;