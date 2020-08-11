FROM buildkite/puppeteer:latest
COPY . /app
WORKDIR /app
RUN npm i
RUN npm run build
CMD ["npm", "start"]