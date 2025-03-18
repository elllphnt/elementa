import React, { forwardRef } from "react";

interface ImageBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

const ImageBox = forwardRef<HTMLDivElement, ImageBoxProps>(
  ({ image, children, style, ...rest }, ref) => {
    const containerStyle: React.CSSProperties = {
      backgroundImage: `url(${image})`,
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      ...style,
    };

    return (
      <div ref={ref} style={containerStyle} {...rest}>
        {children}
      </div>
    );
  },
);

export default ImageBox;
