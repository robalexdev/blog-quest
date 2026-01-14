import {getWebsiteName} from './getWebsiteName';
import {describe, expect, test} from '@jest/globals';
import psl from 'psl';

test('null', () => {
  expect(getWebsiteName(null)).toBe(null);
})

test('empty-string', () => {
  expect(getWebsiteName("")).toBe(null);
})

test('bare domain', () => {
  expect(getWebsiteName("example.com")).toBe(null);
})

test('example.com', () => {
  expect(getWebsiteName("https://example.com")).toBe("example.com");
})

test('example.co.uk', () => {
  expect(getWebsiteName("https://example.co.uk")).toBe("example.co.uk");
})

test('www.example.co.uk', () => {
  expect(getWebsiteName("https://www.example.co.uk")).toBe("example.co.uk");
})

test('people.debian.org/username', () => {
  expect(getWebsiteName("https://people.debian.org/username")).toBe("people.debian.org/username");
})

test('buttondown.com/username', () => {
  expect(getWebsiteName("https://buttondown.com/username")).toBe("buttondown.com/username");
})

// Domain isn't on the PSL
test('username.neocities.org', () => {
  const url = "https://username.neocities.org";

  // This test assumes it hasn't been added to the list
  expect(psl.get(new URL(url).hostname)).toBe("neocities.org");

  expect(getWebsiteName(url)).toBe("username.neocities.org");
})

// Domain is on the PSL
test('username.netlify.app', () => {
  expect(getWebsiteName("https://username.netlify.app")).toBe("username.netlify.app");
})

// Roll-up subreddits
test('reddit.com/r/webdev/', () => {
  expect(getWebsiteName("https://www.reddit.com/r/webdev/")).toBe("reddit.com");
})

// Roll-up Lobster tags
test('https://lobste.rs/t/privacy', () => {
  expect(getWebsiteName("https://lobste.rs/t/privacy")).toBe("lobste.rs");
})

