export type View = {
  id: string;
  render: (props: any) => React.ReactNode;
};
