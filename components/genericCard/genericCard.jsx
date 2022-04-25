import { AgilityImage } from "@agility/nextjs";
import { toDate, resolveCategory } from "../../utils/convert";
import AgilityLink from "../agilityLink";

// A multi-purpose generic card component which can be as a card for many other componenents
// such as blog lists, resources lists, news lists etc.
const GenericCard = ({
  date,
  category,
  overrideCategory,
  title,
  ariaTitle,
  description,
  image,
  link,
  newsSite,
  podcast,
  configuration,
}) => {
  return (
    <AgilityLink
      agilityLink={link}
      ariaLabel={"Navigate to : " + ariaTitle}
      title={ariaTitle}
      className="genericCardWrapper"
    >
      <div className="genericCard">
        {(image || configuration?.defaultImage) && (
          <div
            className={`genericCard__image ${
              configuration?.imageHeight
                ? `genericCard__image--${configuration?.imageHeight}`
                : ""
            }`}
          >
            {image && image.pixelWidth ? (
              <AgilityImage
                src={image.url}
                alt={image.label || ""}
                width={image.pixelWidth}
                height={image.pixelHeight}
                objectFit="cover"
                layout="responsive"
              />
            ) : (
              <AgilityImage
                src={configuration?.defaultImage}
                alt=""
                width="250"
                height="162"
                objectFit="contain"
              />
            )}
          </div>
        )}
        <div className="genericCard__textContent">
          {date && (
            <p className="genericCard__textContent--date">{toDate(date)}</p>
          )}
          {category && !overrideCategory && (
            <p className="genericCard__textContent--category">
              {resolveCategory(category)}
              {podcast && (
                <span className="genericCard__textContent--podcast">
                  Podcast
                </span>
              )}
            </p>
          )}
          {overrideCategory && (
            <p className="genericCard__textContent--category">
              {overrideCategory}
              {podcast && (
                <span className="genericCard__textContent--podcast">
                  Podcast
                </span>
              )}
            </p>
          )}
          {newsSite && (
            <p className="genericCard__textContent--newsSite">{newsSite}</p>
          )}
          {title && (
            <p
              className={`genericCard__textContent--title ${
                configuration?.emphasizedTitle
                  ? "genericCard__textContent--titleEmphasized"
                  : ""
              }`}
            >
              {title}
            </p>
          )}
          {description && (
            <p className="genericCard__textContent--description line-clamp">
              {description}
            </p>
          )}
          <p className="genericCard__textContent--link">
            <span>Read more</span>
          </p>
        </div>
      </div>
    </AgilityLink>
  );
};

export default GenericCard;
