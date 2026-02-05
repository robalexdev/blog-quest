import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import * as ReactDom from "react-dom/client";
import "webextension-polyfill";
import { Website } from "./util/constants";
import { getIconState } from "./util/storage";
import { WebsiteDetailView } from "./website-detail-view";
import { WebsiteListView } from "./website-list-view";

getIconState(() => {
  return { state: "off" };
});

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity } },
});

const sniffAndroid = /\bMobile\b/.test(navigator.userAgent);
function Popup() {
  const [selectedWebsite, setSelectedWebsite] = React.useState<Website>();
  const [isAndroid, setIsAndroid] = React.useState(sniffAndroid);

  React.useLayoutEffect(async () => {
    if (chrome.runtime.getPlatformInfo) {
      chrome.runtime.getPlatformInfo((info) => {
        if (info && info.os == "android" && !isAndroid) {
          setIsAndroid(true);
        }
      });
    }
  }, []);

  let sizing = " h-[600px] w-[350px] ";
  if (isAndroid) {
    sizing = " h-screen w-screen ";
  }

  return (
    <div className={`relative flex ${sizing} flex-col overflow-auto bg-primaryBg`}>
      {!!selectedWebsite ? (
        <WebsiteDetailView
          website={selectedWebsite}
          clearSelectedWebsite={() => setSelectedWebsite(undefined)}
        />
      ) : (
        <WebsiteListView
          sniffAndroid={sniffAndroid}
          setSelectedWebsite={setSelectedWebsite}
        />
      )}
    </div>
  );
}

const rootNode = document.getElementById("root");
if (!rootNode) {
  throw new Error();
}

const root = ReactDom.createRoot(rootNode);

root.render(
  <QueryClientProvider client={queryClient}>
    <Popup />
  </QueryClientProvider>,
);

export const nullIconJsx = (
  <>
    <path
      d="M 2 25.955 L 2 50.909 5.250 51.373 C 7.038 51.629, 14.125 52.332, 21 52.936 C 84.261 58.497, 142.337 95.734, 176.523 152.652 C 190.729 176.305, 201.348 208.766, 203.460 235 C 203.793 239.125, 204.311 245.313, 204.612 248.750 L 205.159 255 230.235 255 L 255.310 255 254.659 241.750 C 252.131 190.296, 232.676 138.977, 199.960 97.465 C 167.325 56.054, 115.406 22.193, 65.195 9.570 C 46.492 4.868, 20.606 1.081, 6.750 1.021 L 2 1 2 25.955 M 2 113.349 L 2 139 8.750 139.022 C 16.594 139.047, 29.317 141.692, 40 145.518 C 73.506 157.520, 100.765 185.199, 111.903 218.527 C 115.055 227.959, 117.989 243.478, 117.996 250.750 L 118 255 143.604 255 L 169.208 255 168.545 246.750 C 165.377 207.321, 150.714 172.240, 125.598 144 C 107.218 123.334, 82.287 106.698, 55.967 97.537 C 43.256 93.112, 24.146 89.153, 11.488 88.322 L 2 87.698 2 113.349 M 24.763 188.456 C 18.828 190.728, 12.186 195.775, 8.475 200.833 C 3.385 207.768, 1.673 213.790, 2.200 222.899 C 3.967 253.414, 40.693 265.900, 61.368 243.014 C 67.479 236.250, 69.429 230.926, 69.429 221 C 69.429 210.663, 67.377 205.456, 60.341 197.933 C 53.263 190.366, 47.426 187.716, 37 187.335 C 31.348 187.129, 27.248 187.504, 24.763 188.456"
      stroke="none"
      fill="#ff8000"
      fill-rule="evenodd"
    />
  </>
);
