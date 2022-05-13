import { useState, useEffect, useRef } from "react";
import AgilityLink from "../../agilityLink";
import Heading from "../heading";
import style from "./jobOpeningList.module.scss";

const JobOpeningList = ({ module, customData }) => {
  const { fields } = module;
  const { jobListData } = customData;
  const heading = fields?.heading ? JSON.parse(fields.heading) : null;
  const searchInputRef = useRef();

  const [jobs, setJobs] = useState(jobListData);
  const [locations, setLocations] = useState([]);
  const [locationFilter, setLocationFilter] = useState(null);
  const [currentSortProperty, setCurrentSortProperty] = useState("title");
  const [currentSortReversed, setCurrentSortReversed] = useState(false);
  const [titleSortDisabled, setTitleSortDisabled] = useState(false);
  const [locationSortDisabled, setLocationSortDisabled] = useState(false);
  const [employmentTypeSortDisabled, setEmploymentTypeSortDisabled] =
    useState(false);

  const sortJobs = (jobsToSort) => {
    const jobsCopy = [...jobsToSort];
    jobsCopy.sort((a, b) => {
      return a[currentSortProperty].localeCompare(b[currentSortProperty]);
    });
    return jobsCopy;
  };

  const filterByKeyword = (keyword) => {
    let jobsCopy = [...jobListData];
    const searchTerm = keyword.toLowerCase();
    const jobsFilteredByKeyword = jobsCopy.filter(
      (job) =>
        (!searchTerm && !locationFilter) ||
        (job.title.toLowerCase().includes(searchTerm) &&
          (!locationFilter || job.location == locationFilter))
    );

    let sortedFilteredJobs = sortJobs(jobsFilteredByKeyword);
    if (currentSortReversed) {
      sortedFilteredJobs = sortedFilteredJobs.reverse();
    }
    setJobs(sortedFilteredJobs);
  };

  const filterByLocation = (selectedLocation) => {
    setLocationFilter(selectedLocation);
  };

  const handleSetCurrentSortProperty = (newSortProperty) => {
    if (newSortProperty !== currentSortProperty) {
      setCurrentSortReversed(false);
      setCurrentSortProperty(newSortProperty);
    } else {
      setCurrentSortReversed(!currentSortReversed);
    }
  };

  const countPropertyValues = (jobArray, property) => {
    const jobPropertyValues = [];
    jobArray.forEach((job) => {
      if (!jobPropertyValues.includes(job[property])) {
        jobPropertyValues.push(job[property]);
      }
    });
    return jobPropertyValues.length;
  };

  useEffect(() => {
    const allLocations = [];
    jobListData.forEach((job) => {
      if (!allLocations.includes(job.location)) {
        allLocations.push(job.location);
      }
    });
    setLocations(allLocations);
    setJobs(sortJobs(jobs));
  }, []);

  useEffect(() => {
    setTitleSortDisabled(countPropertyValues(jobs, "title") < 2);
    setLocationSortDisabled(countPropertyValues(jobs, "location") < 2);
    setEmploymentTypeSortDisabled(
      countPropertyValues(jobs, "employmentType") < 2
    );
  }, [jobs]);

  useEffect(() => {
    filterByKeyword(searchInputRef.current.value);
  }, [locationFilter]);

  useEffect(() => {
    setJobs(sortJobs(jobs, currentSortProperty));
  }, [currentSortProperty]);

  useEffect(() => {
    const jobsCopy = [...jobs];
    setJobs(jobsCopy.reverse());
  }, [currentSortReversed])

  return (
    <>
      {jobListData.length > 0 && (
        <section className={`section ${style.jobOpeningList}`}>
          <div className="container">
            {heading?.text && (
              <div className="heading mb-3">
                <Heading {...heading} />
              </div>
            )}
            <label htmlFor="job-search-input">Search</label>
            <input
              id="job-search-input"
              type={"text"}
              ref={searchInputRef}
              onChange={(e) => {
                filterByKeyword(e.target.value);
              }}
            />
            <label htmlFor="job-location-dropdown">Filter by location</label>
            <select
              id="job-location-dropdown"
              onChange={(e) => {
                filterByLocation(e.target.value);
              }}
            >
              <option value="">All</option>
              {locations.map((location, index) => {
                return (
                  <option key={`location${index}`} value={location}>
                    {location}
                  </option>
                );
              })}
            </select>
            {jobs.length > 0 ? (
              <table className={style.jobOpenings}>
                <thead>
                  <tr>
                    <th>
                      <div className={style.headerContentWrapper}>
                        <p>Job title</p>
                        <button
                          title="Sort jobs by title"
                          aria-label="Sort jobs by title"
                          aria-disabled={titleSortDisabled}
                          onClick={() => {
                            if (!titleSortDisabled) {
                              handleSetCurrentSortProperty("title");
                            }
                          }}
                        >
                          Sort
                        </button>
                      </div>
                    </th>
                    <th>
                      <div className={style.headerContentWrapper}>
                        <p>Location</p>
                        <button
                          title="Sort jobs by location"
                          aria-label="Sort jobs by location"
                          aria-disabled={locationSortDisabled}
                          onClick={() => {
                            if (!locationSortDisabled) {
                              handleSetCurrentSortProperty("location");
                            }
                          }}
                        >
                          Sort
                        </button>
                      </div>
                    </th>
                    <th>
                      <div className={style.headerContentWrapper}>
                        <p>Employment type</p>
                        <button
                          title="Sort jobs by employment type"
                          aria-label="Sort jobs by employment type"
                          aria-disabled={employmentTypeSortDisabled}
                          onClick={() => {
                            if (!employmentTypeSortDisabled) {
                              handleSetCurrentSortProperty("employmentType");
                            }
                          }}
                        >
                          Sort
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, index) => {
                    return (
                      <tr key={`job${index}`} className={style.jobOpening}>
                        <td>
                          <AgilityLink
                            agilityLink={{ href: `/jobs/${job.id}` }}
                            ariaLabel={`Navigate to job opening page: ${
                              job.title
                            } (${
                              job.location
                            }, employment type: ${job.employmentType.toLowerCase()})`}
                          >
                            {job.title}
                          </AgilityLink>
                        </td>
                        <td>{job.location}</td>
                        <td>{job.employmentType}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="mt-2">No results found.</p>
            )}
          </div>
        </section>
      )}
    </>
  );
};

JobOpeningList.getCustomInitialProps = async function () {
  const fetchedData = await fetch(
    process.env.NEXT_PUBLIC_GREENHOUSE_JOB_LIST_API_ENDPOINT,
    { method: "GET" }
  );
  const fetchedDataJson = await fetchedData.json();
  let jobListData = [];
  fetchedDataJson.jobs.forEach((job) => {
    let employmentType;
    if (job.metadata.length > 0) {
      job.metadata.forEach((meta) => {
        if (meta.name.toLowerCase() == "employment type") {
          employmentType = meta.value ? meta.value : "Unspecified";
        }
      });
    }
    jobListData.push({
      location: job.location.name,
      title: job.title,
      employmentType: employmentType,
      id: job.id
    });
  });
  jobListData = jobListData.sort((a, b) => {
    return a.title.localeCompare(b.title);
  });
  return { jobListData };
};

export default JobOpeningList;
