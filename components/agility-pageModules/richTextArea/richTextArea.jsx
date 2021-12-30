import { renderHTML } from "@agility/nextjs";
import { sanitizeHtmlConfig } from "../../../utils/convert";
import { boolean } from "../../../utils/validation";
import style from "./richTextArea.module.scss";

const RichTextArea = ({ module, customData }) => {
  const { sanitizedHtml } = customData;
  const { fields } = module;
  const fullContainerWidth = boolean(fields?.fullContainerWidth);
  const alignCenter = boolean(fields?.alignCenter);
  const narrowContainer = boolean(fields?.narrowContainer);

  return (
    <section
      className={`section ${style.richTextArea} ${
        fields.classes ? fields.classes : ""
      }`}
      id={fields.id ? fields.id : null}
    >
      <div
        className={`container content ${
          fullContainerWidth ? style.fullContainerWidthContent : style.content
        } ${alignCenter ? "align-center" : ""} ${
          narrowContainer ? "max-width-narrow" : ""
        }`}
        dangerouslySetInnerHTML={renderHTML(sanitizedHtml)}
      ></div>
    </section>
  );
};

RichTextArea.getCustomInitialProps = async function ({ item }) {
  const sanitizeHtml = (await import("sanitize-html")).default;
  // sanitize unsafe HTML ( all HTML entered by users and any HTML copied from WordPress to Agility)

  const cleanHtml = (html) => sanitizeHtml(html, sanitizeHtmlConfig);

  const sanitizedHtml = item.fields.textblob
    ? cleanHtml(item.fields.textblob)
    : null;

  return {
    sanitizedHtml,
  };
};

export default RichTextArea;
