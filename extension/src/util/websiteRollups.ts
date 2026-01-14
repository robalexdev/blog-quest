// These use the form https://blog.example.com/username
// Keep sorted
export const fqdnFirstUrlPath = [
  "blog.uvm.edu",
  "blogs.fsfe.org",
  "people.debian.org",
];

// These use the form https://example.com/username
// Keep sorted
export const domainFirstUrlPath = [
  "buttondown.com",
  "dev.to",
  "medium.com",
  "write.as",
];

// These use the form https://username.example.com
// Note: we also check the https://publicsuffix.org/list/
// Only add domains here if they are not on the PSL
// Keep sorted
export const domainFirstSubdomain = [
  "beehiiv.com",
  "dreamwidth.org",
  "ghost.io",
  "hashnode.dev",
  "micro.blog",
  "neocities.org",
  "pika.page",
  "substack.com",
  "wordpress.com",
];
