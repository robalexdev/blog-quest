import { getDataUrlFromFile } from "./getDataUrlFromFile";
import { getAllFeeds } from "./getWebsites";
import { db } from "./storage";

async function asDataUrl(blob: Blob): string {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(reader.result as string);
    reader.onerror = e => reject(reader.error);
    reader.onabort = e => reject(new Error("Read aborted"));
    reader.readAsDataURL(blob);
  });
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '"': return '&quot;';
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '\'': return '&apos;';
        }
    });
}

export async function exportFeeds(): Promise<void> {
  const feeds = await getAllFeeds(db);

  let xmlDoc = document.implementation.createDocument(null, "opml");
  xmlDoc.children[0].setAttribute("version", "2.0");

  let xmlHead = xmlDoc.createElement("head");
  xmlDoc.children[0].appendChild(xmlHead);

  let xmlHeadTitle = xmlDoc.createElement("title");
  xmlHead.appendChild(xmlHeadTitle);
  xmlHeadTitle.appendChild(xmlDoc.createTextNode("Exported from Blog Quest"));

  let xmlHeadDescription = xmlDoc.createElement("description");
  xmlHead.appendChild(xmlHeadDescription);
  xmlHeadDescription.appendChild(
    xmlDoc.createTextNode(
      "These feeds were collected by the Blog Quest browser extension",
    ),
  );

  let xmlBody = xmlDoc.createElement("body");
  xmlDoc.children[0].appendChild(xmlBody);

  for (const feed of feeds) {
    let xmlOutline = xmlDoc.createElement("outline");
    // Even when the feed is an Atom feed, "rss" appears to be the correct value
    xmlOutline.setAttribute("type", "rss");
    xmlOutline.setAttribute("text", escapeXml(feed.title));
    xmlOutline.setAttribute("xmlUrl", escapeXml(feed.feedUrl));

    // TODO: this really should be the website URL linked in
    // the body of the RSS feed, or perhaps the base URL of
    // the blog
    // Is there a good way to do that here?
    xmlOutline.setAttribute("htmlUrl", "https://" + escapeXml(feed.website));

    xmlOutline.setAttribute("category", "all");
    xmlBody.appendChild(xmlOutline);
  }

  const xmlstr = new XMLSerializer().serializeToString(xmlDoc);

  const blob = new Blob([xmlstr], {
    type: "application/xml",
  });

  const dataUrl = await asDataUrl(blob);
  const aElem = document.createElement("a");
  aElem.setAttribute("href", dataUrl);
  aElem.setAttribute("download", "blog-quest-export.opml");
  aElem.click();
}
