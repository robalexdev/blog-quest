import { MaybePromise } from "./constants";
import { getIsUrlHttpOrHttps } from "./getIsUrlHttpOrHttps";

export function getHrefProps(
  baseHref: string,
  getActualHref?: () => MaybePromise<string>,
): Pick<JSX.IntrinsicElements["a"], "href" | "onClick"> {
  return {
    href: baseHref,
    async onClick(ev) {
      ev.preventDefault();
      const { metaKey } = ev;
      const href = (await getActualHref?.()) ?? baseHref;
      if (getIsUrlHttpOrHttps(href)) {
        browser.runtime.sendMessage({
          name: "OPEN_TAB",
          args: {
            url: href,
            metaKey: metaKey,
          }
        })
        if (!metaKey) {
          window.close();
        }
      }
    },
  };
}
