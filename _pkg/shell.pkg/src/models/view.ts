export type View = {
  id: string;
  render: (props: any) => React.ReactNode;
  preferredWidth?: number;
  preferredHeight?: number;
};
