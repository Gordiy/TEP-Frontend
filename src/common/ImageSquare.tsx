import Image, { StaticImageData } from "next/image";
import { cn } from "utils/cn";

export type ImageSquareProps = {
  source: StaticImageData | string;
  alt?: string;
  onClick?: () => void;
  classes?: {
    wrapper?: string;
    image?: string;
  };
};

const APIurl = process.env.NEXT_PUBLIC_API_URL;

export function ImageSquare(props: ImageSquareProps) {
  const { source, alt = "Image", classes, onClick, ...imageProps } = props;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl pb-[100%]",
        classes?.wrapper,
      )}
    >
      <Image
        onClick={onClick}
        src={typeof(source) === "string" ? APIurl + source : source}
        alt={alt}
        fill
        className={cn("object-cover", classes?.image)}
        {...imageProps}
      />
    </div>
  );
}
