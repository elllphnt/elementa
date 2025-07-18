import { Link } from "@elllphnt/elementa-framework/navigation";

export const css = `
  #root {
    color: red;
  }
  #a_link {
    color: blue;
  }
  #c_link:hover {
    color: green;
    animation: fadeIn 1s ease-in-out;
  }
  .link-active {
    font-weight: bold;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    } 
  }
`;

export default function A() {
  return (
    <div id="root">
      This is Page B.
      <br />
      <Link id="a_link" to="/a" className={{ "link-active": true }}>
        <span>Go to Page A</span>
      </Link>
      <br />
      <Link
        id="c_link"
        to="/c"
        className={{
          "link-active": true,
        }}
      >
        <span>KLM Go to Page C</span>
      </Link>
    </div>
  );
}

export const stage = {
  showInViewport: true,
  variants: [
    {
      name: "default",
      props: {},
    },
  ],
};

/*
The following is for internal use only.
DO NOT MODIFY.
__ID_MAP_START__
a_link: 45g564
c_link: 78h789
root: 12a345
__ID_MAP_END__
*/
