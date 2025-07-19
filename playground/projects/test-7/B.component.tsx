import { Link } from "elll/navigation";

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
  #text_34 {
    font-size: 20px;
  }
`;

export default function A(props: { user: string }) {
  return (
    <div id="root">
      This is Page B. {props.user}
      <br />
      <Link id="a_link" to="/a" className={{ "link-active": true }}>
        <span id="text_34">Go to Page A</span>
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

/**
 * Editor information for the elements in this component.
 * This is used to provide metadata for the editor.
 */
export const metadata = {
  name: "A",
  description: "Main screen for XYZ flow",
  elements: {
    a_link: {
      id: "345f67",
      name: "Link to Page A",
    },
    c_link: {
      id: "678f90",
      name: "Link to Page C",
    },
    root: {
      id: "123f45",
      name: "Root Element",
    },
    text_34: {
      id: "234f56",
      name: "Text Element",
    },
  },
  stage: {
    showInViewport: true,
    variants: [{ name: "default", props: {} }],
  },
};
