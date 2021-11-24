import style from "./blogPageContent.module.scss";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Loader from "../../layout/loader/loader";
import BlogCard from "./blogCard";
import {
  sortContentListByDate,
  removeDuplicatePosts,
} from "../../../utils/convert";
import BlogLoader from "./blogLoader";

const BlogPageContent = ({ customData }) => {
  const { query } = useRouter();
  const { contentListTypes } = customData; // includes only blog posts
  const [mounted, setMounted] = useState(false);
  const [activePageNumber, setActivePageNumber] = useState(0); // number of the current page.
  const [totalPagesCount, setTotalPagesCount] = useState(null); // total count of pages.
  const [currentOffset, setCurrentOffset] = useState(0); // current offset in the active content list.
  const [page, setPage] = useState(null); // the contents of current page.
  const [activeContentList, setActiveContentList] = useState(null); // these are their own states because it makes handing multiple categories easier.
  const [activeContentType, setActiveContentType] = useState(null); // these are their own states because it makes handing multiple categories easier.
  const [contentCategories, setContentCategories] = useState(null); // these are their own states because it makes handing multiple categories easier.
  const [activeCategories, setActiveCategories] = useState([]); // currently selected categories.

  const PER_PAGE = 9; // how many cards are shown per page

  // initial load: check if query params are provided in the url, set active content type and categories accordingly
  useEffect(() => {
    if (query.type) {
      let queriedType = contentListTypes.find((type) => type.id === query.type);
      const categories = query?.categories?.split(",");
      setActiveContentType(queriedType.id);
      setActiveContentList(queriedType.content);
      setContentCategories(queriedType.categories);
      if (categories) {
        setActiveCategories(categories);
      }
    } else {
      setActiveContentType(contentListTypes[0].id);
      setActiveContentList(contentListTypes[0].content);
      setContentCategories(contentListTypes[0].categories);
    }
  }, []);

  // reset offset and when active content list changes, update total pages count and set the content of the current page if the list is not null.
  useEffect(() => {
    setCurrentOffset(0);
    setActivePageNumber(0);
    if (activeContentList) {
      setTotalPagesCount(Math.ceil(activeContentList.length / PER_PAGE));
      setPage(activeContentList.slice(currentOffset, currentOffset + PER_PAGE));
    }
  }, [activeContentList]);

  // reset offset and when active content type changes
  useEffect(() => {
    setCurrentOffset(0);
    setActivePageNumber(0);
  }, [activeContentType]);

  // if active categories changes and there are at least one category on the list, reset offset and update the active content list based on the selected categories.
  useEffect(() => {
    if (activeCategories.length > 0) {
      setCurrentOffset(0);
      let newContentList = getSortedContentByActiveCategories();
      setActiveContentList(newContentList);
      // if there are no selected categories, just set the content list to include all categories (the default content for selected content type).
    } else if (activeContentType) {
      setCurrentOffset(0);
      let list = contentListTypes.find(
        (type) => type.id === activeContentType
      ).content;
      if (list.length !== activeContentList) {
        setActiveContentList(list);
      }
    }
  }, [activeCategories]);

  // update the page content when current offset changes.
  useEffect(() => {
    if (activeCategories && activeContentList)
      setPage(activeContentList.slice(currentOffset, currentOffset + PER_PAGE));
    else if (activeContentList)
      setPage(activeContentList.slice(currentOffset, currentOffset + PER_PAGE));
  }, [currentOffset]);

  // returns a sorted content list with the contents of selected categories.
  const getSortedContentByActiveCategories = () => {
    let newContentList = [];
    if (activeCategories) {
      activeCategories.forEach((category) => {
        newContentList = [
          ...newContentList,
          ...contentCategories[category].content,
        ];
      });
      return sortContentListByDate(removeDuplicatePosts(newContentList));
    } else {
      return activeContentList;
    }
  };
  // reset page data when content list type changes
  const handleContentListTypeChange = (id) => {
    if (id.length === 0) return;
    setPage(null);
    const newType = contentListTypes.find((type) => type.id === id);
    setActiveContentType(newType.id);
    setContentCategories(newType.categories);
    setActiveContentList(newType.content);
  };

  // when some category is selected update the active categories list accordingly.
  const handleCategoryChange = (event, category) => {
    if (!event.target.checked) {
      let newCategories = activeCategories.filter(
        (active) => active !== category
      );
      setActiveCategories(newCategories);
    } else {
      let newCategories = [...activeCategories, category];
      setActiveCategories(newCategories);
    }
  };

  const previousPage = () => {
    let newPageNumber = activePageNumber - 1;
    if (newPageNumber >= 0) {
      setCurrentOffset(newPageNumber * PER_PAGE);
      setActivePageNumber(newPageNumber);
    }
  };

  const nextPage = () => {
    let newPageNumber = activePageNumber + 1;
    if (newPageNumber < totalPagesCount) {
      setCurrentOffset(newPageNumber * PER_PAGE);
      setActivePageNumber(newPageNumber);
    }
  };

  return (
    <section className={`section ${style.blogPageContent}`}>
      <nav
        className={`container ${style.navigationMenu}`}
        aria-label="blog posts navigation"
      >
        <aside className={style.filterPanel}>
          <label htmlFor="select-content-type">
            Content type
            <select
              id="select-content-type"
              className={style.contentTypeSelect}
              value={activeContentType}
              onChange={(event) =>
                handleContentListTypeChange(event.target.value)
              }
            >
              {activeContentList && (
                <>
                  {contentListTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.title}
                    </option>
                  ))}
                </>
              )}
            </select>
          </label>
          {contentCategories && (
            <fieldset>
              <legend>Category</legend>
              {Object.entries(contentCategories).map(([key, category], i) => (
                <label key={key + "Checkbox"} htmlFor={key + "Checkbox"}>
                  <input
                    type="checkbox"
                    id={key + "Checkbox"}
                    checked={activeCategories.find(
                      (category) => category === key
                    )}
                    onChange={(event) => handleCategoryChange(event, key)}
                  />
                  {category.title}
                </label>
              ))}
            </fieldset>
          )}
        </aside>

        <div className={style.contentList}>
          {(page && (
            <>
              {(page.length > 0 && (
                <div className="columns repeat-3">
                  {page.map((item) => (
                    <div key={item.contentID}>
                      <BlogCard
                        image={item.fields?.image}
                        title={item.fields.title}
                        link={{ href: `blog/${item.fields.slug}` }}
                        date={item.fields.date}
                        category="Blog"
                      />
                    </div>
                  ))}
                </div>
              )) || <p>Nothing here...</p>}
            </>
          )) || <BlogLoader />}
        </div>
        {/* Display the page numbers. truncate if there's a lot of pages*/}
        <footer className={style.pagination}>
          <div className="d-flex">
            <button
              className={`reset-button ${style.previousPageButton}`}
              onClick={previousPage}
              disabled={activePageNumber === 0}
            ></button>
            {totalPagesCount && (
              <>
                {totalPagesCount < 8 ? (
                  [...Array(totalPagesCount).keys()].map((pageNumber) => (
                    <div
                      key={`pageButton${pageNumber}`}
                      className={pageNumber === activePageNumber ? "w-600" : ""}
                    >
                      <button
                        className={`reset-button ${style.pageButton}`}
                        onClick={() => {
                          setCurrentOffset(pageNumber * PER_PAGE);
                          setActivePageNumber(pageNumber);
                        }}
                        key={pageNumber}
                      >
                        {pageNumber + 1}
                      </button>
                    </div>
                  ))
                ) : (
                  <>
                    <div className={activePageNumber === 0 ? "w-600" : ""}>
                      <button
                        className={`reset-button ${style.pageButton}`}
                        onClick={() => {
                          setCurrentOffset(0);
                          setActivePageNumber(0);
                        }}
                        key={1}
                      >
                        1
                      </button>
                    </div>
                    {activePageNumber < 4 && (
                      <>
                        {[...Array(totalPagesCount).keys()]
                          .slice(1, 4)
                          .map((pageNumber) => (
                            <div
                              key={`pageButton${pageNumber}`}
                              className={
                                pageNumber === activePageNumber ? "w-600" : ""
                              }
                            >
                              <button
                                className={`reset-button ${style.pageButton}`}
                                onClick={() => {
                                  setCurrentOffset(pageNumber * PER_PAGE);
                                  setActivePageNumber(pageNumber);
                                }}
                                key={pageNumber}
                              >
                                {pageNumber + 1}
                              </button>
                            </div>
                          ))}
                        ...
                      </>
                    )}
                    {activePageNumber > 3 &&
                      activePageNumber < totalPagesCount - 3 && (
                        <>
                          ...
                          {[...Array(totalPagesCount).keys()]
                            .slice(activePageNumber - 1, activePageNumber + 2)
                            .map((pageNumber) => (
                              <div
                                key={`pageButton${pageNumber}`}
                                className={
                                  pageNumber === activePageNumber ? "w-600" : ""
                                }
                              >
                                <button
                                  className={`reset-button ${style.pageButton}`}
                                  onClick={() => {
                                    setCurrentOffset(pageNumber * PER_PAGE);
                                    setActivePageNumber(pageNumber);
                                  }}
                                  key={pageNumber}
                                >
                                  {pageNumber + 1}
                                </button>
                              </div>
                            ))}
                          ...
                        </>
                      )}
                    {activePageNumber > totalPagesCount - 4 && (
                      <>
                        ...
                        {[...Array(totalPagesCount).keys()]
                          .slice(totalPagesCount - 4, totalPagesCount - 1)
                          .map((pageNumber) => (
                            <div
                              key={`pageButton${pageNumber}`}
                              className={
                                pageNumber === activePageNumber ? "w-600" : ""
                              }
                            >
                              <button
                                className={`reset-button ${style.pageButton}`}
                                onClick={() => {
                                  setCurrentOffset(pageNumber * PER_PAGE);
                                  setActivePageNumber(pageNumber);
                                }}
                                key={pageNumber}
                              >
                                {pageNumber + 1}
                              </button>
                            </div>
                          ))}
                      </>
                    )}
                    <div
                      className={
                        activePageNumber === totalPagesCount - 1 ? "w-600" : ""
                      }
                    >
                      <button
                        className={`reset-button ${style.pageButton}`}
                        onClick={() => {
                          setCurrentOffset(totalPagesCount - 1 * PER_PAGE);
                          setActivePageNumber(totalPagesCount - 1);
                        }}
                        key={totalPagesCount - 1}
                      >
                        {totalPagesCount}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            <button
              className={`reset-button ${style.nextPageButton}`}
              onClick={nextPage}
              disabled={activePageNumber + 1 === totalPagesCount}
            ></button>
          </div>
          <p>
            Showing {activePageNumber + 1} of {totalPagesCount}
          </p>
        </footer>
      </nav>
    </section>
  );
};

BlogPageContent.getCustomInitialProps = async function ({
  agility,
  languageCode,
}) {
  const api = agility;
  let contentListTypes = [
    {
      title: "Blog Posts",
      id: "blogposts",
      content: [],
      categories: null,
    },
  ];

  async function getContentList(referenceName) {
    // get total count of  to determine how many calls we need to get all pages
    let initial = await api.getContentList({
      referenceName,
      languageCode,
      take: 1,
    });

    let totalCount = initial.totalCount;
    let skip = 0;
    let promisedPages = [...Array(Math.ceil(totalCount / 50)).keys()].map(
      (call) => {
        let pagePromise = api.getContentList({
          referenceName,
          languageCode,
          take: 50, // 50 is max value for take parameter
          skip,
        });
        skip += 50;
        return pagePromise;
      }
    );
    promisedPages = await Promise.all(promisedPages);
    let contentList = [];
    promisedPages.map((result) => {
      contentList = [...contentList, ...result.items];
    });
    return contentList;
  }

  function categoryNameSimple(title) {
    return title.toLowerCase().split(" ").join("_").split("-").join("_");
  }
  // get blog pots
  const blogPosts = await getContentList("blogPosts");
  const categories = await getContentList("categories");
  let blogCategories = {};
  categories.forEach((category) => {
    blogCategories[categoryNameSimple(category.fields.title)] = {
      title: category.fields.title,
      content: [],
    };
  });
  Object.values(blogCategories).forEach((values) => {
    const relatedPosts = blogPosts.filter((post) =>
      post.fields?.categories?.some(
        (category) => category.fields.title === values.title
      )
    );
    values.content = relatedPosts;
  });
  contentListTypes[0].content = [...contentListTypes[0].content, ...blogPosts];
  contentListTypes[0].categories = blogCategories;

  return {
    contentListTypes,
  };
};

export default BlogPageContent;