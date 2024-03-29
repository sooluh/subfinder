<a href="https://s.id/standwithpalestine"><img alt="I stand with Palestine" src="https://github.com/Safouene1/support-palestine-banner/blob/master/banner-project.svg" width="100%" /></a>

# Subdomain Finder

[Subfinder](https://github.com/sooluh/subfinder) is used to find, scan and collect subdomains of any domain

## Install

```
npm i @sooluh/subfinder
```

## Usage

```javascript
const Subfinder = require("@sooluh/subfinder");
const subfinder = new Subfinder();

// callback
subfinder.lookup("domain.com", function (subdomains, error) {
  if (error) return console.error(error);

  console.log(subdomains);
});

// promise with then/catch
subfinder.lookup("domain.com")
  .then(console.log)
  .catch(console.error);

// promise with async/await
(async () => {
  try {
    const subdomains = await subfinder.lookup("domain.com");
    console.log(subdomains);
  } catch (error) {
    console.error(error);
  }
})();
```

## License

Code licensed under [MIT License](./LICENSE).
