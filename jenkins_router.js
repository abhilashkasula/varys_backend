const express = require('express');
const data = require('./sample_data.json');

const router = express.Router();

const getLabels = () => {
  const labels = [];
  for (let i = 4; i >= 0; i--) {
    const date = new Date(new Date() - i * 24 * 60 * 60 * 1000);
    labels.push([date.getDate(), date.getMonth() + 1]);
  }
  return labels;
};

const filterJobs = (labels, jobs, regex) =>
  labels.map(([date, month]) =>
    jobs.filter((job) => {
      const {timestamp: ts} = job.build;
      const [jobDate, jobMonth] = [
        new Date(ts).getDate(),
        new Date(ts).getMonth() + 1,
      ];
      return (
        date === jobDate && month === jobMonth && job.build.result.match(regex)
      );
    })
  );

const getAverageDuration = (labels, jobs) => {
  return labels
    .map(([date, month]) => {
      const filtered = jobs.filter((job) => {
        const {timestamp: ts} = job.build;
        const [jobDate, jobMonth] = [
          new Date(ts).getDate(),
          new Date(ts).getMonth() + 1,
        ];
        return date === jobDate && month === jobMonth;
      });
      const totalDuration = filtered.reduce(
        (total, {build: {duration}}) => total + duration,
        0
      );
      return totalDuration / filtered.length || 0;
    })
    .map((duration) => duration / 1000);
};

router.get('/perDayStats', (req, res) => {
  const endDate = new Date();
  const startDate = new Date(endDate - 5 * 24 * 60 * 60 * 1000);
  const jobs = data.job.builds.filter(
    ({build: {timestamp}}) => timestamp >= startDate && timestamp <= endDate
  );
  const labels = getLabels();
  const succeededJobs = filterJobs(labels, jobs, 'SUCCESS');
  const failedJobs = filterJobs(labels, jobs, '[^SUCCESS]');
  const averageDurations = getAverageDuration(labels, jobs);
  res.json({labels, succeededJobs, failedJobs, averageDurations});
});

router.get('/latestBuilds', (req, res) => {
  const last5Jobs = data.job.builds.slice(0, 5);
  const latestJobs = last5Jobs.map((job) => ({
    status: job.build.result,
    number: job.number,
    url: job.url,
  }));
  res.json(latestJobs);
});

module.exports = {router};
