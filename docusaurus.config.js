// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
require("dotenv").config();

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Mark1",
  tagline: "Seiwon Park's Logs",
  url: "https://www.seiwon.dev",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "/logs",
          editUrl: "https://github.com/SeiwonPark/mark1/edit/main/",
        },
        blog: {
          showReadingTime: true,
          routeBasePath: "/posts",
          editUrl: "https://github.com/SeiwonPark/mark1/edit/main/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        googleAnalytics: {
          trackingID: process.env.REACT_APP_TRACKING_ID,
          anonymizeIP: true,
        },
        gtag: {
          trackingID: process.env.REACT_APP_TRACKING_ID,
          anonymizeIP: true,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Seiwon Park",
        logo: {
          alt: "Mark1 Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Logs",
          },
          {
            to: "/posts",
            label: "Posts",
            position: "left",
          },
          {
            href: "https://github.com/SeiwonPark/mark1",
            position: "right",
            className: "nav-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Community",
            items: [
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/docusaurus",
              },
              {
                label: "Discord",
                href: "https://discordapp.com/invite/docusaurus",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/docusaurus",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Seiwon Park`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: process.env.REACT_APP_ALGOLIA_APP_ID,
        apiKey: "bc1e25ba07636c221f53391671815c1c",
        indexName: "index",
        contextualSearch: false,
        // externalUrlRegex: "google\\.com|naver\\.com|tistory\\.com",
        searchParameters: {},
        searchPagePath: "search",
      },
    }),
  /**
   * webpack override from babel to swc
   */
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve("swc-loader"),
      options: {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          target: "es2017",
        },
        module: {
          type: isServer ? "commonjs" : "es6",
        },
      },
    }),
  },
};

module.exports = config;
