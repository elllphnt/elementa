const collapseKey = (domainId: string) =>
  `spec-editor.domains.${domainId}.collapsed`;

function Header({ domain }: { domain: any }) {
  // const project = useElllProject();
  // const data = useObservable(domain.data$, domain.data);
  // const [collapsed, setCollapsed] = useWorkspaceState(
  //   collapseKey(domain.id),
  //   false,
  // );
  // return (
  //   <div className="el-group el-p-1 el-flex el-items-center el-justify-between">
  //     <div className="el-flex el-items-center el-gap-2">
  //       <IconButton
  //         icon={elllIcons16.chevron}
  //         iconClassName={cx("el-transition-transform", {
  //           "el-rotate-90": !collapsed,
  //         })}
  //         onClick={() => setCollapsed(!collapsed)}
  //       />
  //       <h2 className="el-font-semibold">{data.name}</h2>
  //     </div>

  //     <div className="el-flex el-gap-2 el-invisible group-hover:el-visible">
  //       <IconButton
  //         icon={elllIcons16.cross}
  //         onClick={() => {
  //           project.spec.removeDomain(domain.id);
  //         }}
  //       />
  //     </div>
  //   </div>
  // );

  return <>Header</>;
}

export function DomainContainer({ domain }: { domain: any }) {
  // const project = useElllProject();
  // const features = useObservable(
  //   project.spec.featuresByDomain$(domain.id),
  //   project.spec.featuresByDomain(domain.id),
  // );
  // const [collapsed] = useWorkspaceState(collapseKey(domain.id), false);

  // return (
  //   <Droppable droppableId={domain.id} direction="vertical" type="feature">
  //     {(provided, snapshot) => (
  //       <div
  //         ref={provided.innerRef}
  //         {...provided.droppableProps}
  //         className={cx("el-rounded-md el-p-1 el-space-y-1", {
  //           "el-bg-bg-200/20": snapshot.isDraggingOver && !collapsed,
  //           "hover:el-bg-bg-200/20": collapsed,
  //         })}
  //       >
  //         <Header domain={domain} />
  //         {!collapsed ? (
  //           <div>
  //             <FeatureList features={features} />
  //             {provided.placeholder}
  //           </div>
  //         ) : (
  //           <></>
  //         )}
  //       </div>
  //     )}
  //   </Droppable>
  // );

  return <>DomainContainer</>;
}
