const express = require('express');
const {router: jenkinsRouter} = require('./jenkins_router');

const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

app.use('/api/build', jenkinsRouter);

app.listen(1234, () => console.log(`listening at 1234`));
