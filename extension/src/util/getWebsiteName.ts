import psl from "psl";

import {
  fqdnFirstUrlPath,
  domainFirstUrlPath,
  domainFirstSubdomain,
} from "./websiteRollups";

const firstSubdomain = (url: URL, domainName: string) => {
  const domainNameDotCount = (domainName.match(/\./g) || []).length;
  const fqdnParts = url.hostname.split("\.");
  const websiteParts = fqdnParts.slice(-1 * (domainNameDotCount + 2));
  return websiteParts.join(".");
};

const firstUrlPath = (url: URL, domainName: string) => {
  const firstPath = url.pathname.split("/")[1];
  if (!!firstPath) {
    return domainName + "/" + firstPath;
  } else {
    return domainName;
  }
};

//
// When rolling up feeds collect them under a unified website name
//
export const getWebsiteName = function (tabUrl: string) {
  if (!URL.canParse(tabUrl)) {
    return null;
  }

  const url = new URL(tabUrl);
  const fqdn = url.hostname;

  // Check if we have any special cases for the FQDN
  if (fqdnFirstUrlPath.includes(fqdn)) {
    return firstUrlPath(url, fqdn);
  }

  // Get rid of any subdomains
  const domainName = psl.get(fqdn);
  if (!domainName) {
    return null;
  }

  if (domainFirstUrlPath.includes(domainName)) {
    return firstUrlPath(url, domainName);
  }

  if (domainFirstSubdomain.includes(domainName)) {
    return firstSubdomain(url, domainName);
  }

  // No custom rule exists, use the bare domain name identified by the PSL
  return domainName;
};
