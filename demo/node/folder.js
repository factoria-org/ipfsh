const ipfsh = require('../../index');
(async () => {
  const root = await ipfsh.directory("nueva")
  console.log(root)
})();
