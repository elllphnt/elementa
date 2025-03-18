import Variable from "./ImageBox";

const Component = () => {
  return (
    <Variable
      className="[--height-grow:0] [--height-shrink:0] [height:100%] [flex-grow:calc(var(--width-grow,_0)_*_var(--is-main-width,_0)_+_var(--height-grow,_0)_*_var(--is-main-height,_0))] [flex-shrink:calc(var(--width-shrink,_0)_*_var(--is-main-width,_0)_+_var(--height-shrink,_0)_*_var(--is-main-height,_0))] [--width-grow:0] [--width-shrink:0] [width:100%] [padding-top:36px] [padding-right:36px] [padding-bottom:36px] [padding-left:36px] [position:relative]"
      image={{
        __reference: {
          type: "drive-file",
          id: "dfl_prta5ep62tstaavgnm0eumbg_5clui7yze9z72npg0800gdfm",
        },
      }}
    >
      <div className="[display:flex] [align-items:center] [justify-content:center] [column-gap:8px] [row-gap:8px] [--elll-background-color:rgb(255_255_255_/_1)] [background:var(--elll-background-layers)_var(--elll-background-color)] [opacity:1] [border-top-left-radius:0px] [border-top-right-radius:0px] [border-bottom-left-radius:0px] [border-bottom-right-radius:0px] [position:absolute] [top:5%] [right:7%] [bottom:16%] [left:6%]" />
      <div className="[display:flex] [align-items:center] [justify-content:center] [column-gap:8px] [row-gap:8px] [--elll-background-color:rgb(255_255_255_/_1)] [background:var(--elll-background-layers)_var(--elll-background-color)] [--height-grow:0] [--height-shrink:0] [height:11%] [flex-grow:calc(var(--width-grow,_0)_*_var(--is-main-width,_0)_+_var(--height-grow,_0)_*_var(--is-main-height,_0))] [flex-shrink:calc(var(--width-shrink,_0)_*_var(--is-main-width,_0)_+_var(--height-shrink,_0)_*_var(--is-main-height,_0))] [position:absolute] [left:0px] [right:0px] [bottom:0px]" />
    </Variable>
  );
};

export default Component;
