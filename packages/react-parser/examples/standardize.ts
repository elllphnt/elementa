import { standardizeComponent } from "../src/index.js";

const code = `
const Value = forwardRef(({nuttela: {nuttela = 90, fg: [[name = 90]=[45]]=[]}={mkl:90}}, ref)=>{
const props = 100;
  const color = <span>red</span>;
  if(props) {
    return <span>{color}</span>;
  }else{
    return 1 + 7;
  }
})
export default memo(Value, ()=>{});
`;

const std = standardizeComponent(code);
console.log(std);
