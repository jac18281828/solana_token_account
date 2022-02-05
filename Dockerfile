ARG VERSION=latest
FROM jac18281828/tsdev:${VERSION}

ARG PROJECT=token_account
WORKDIR /workspaces/${PROJECT}

COPY package.json .
COPY package-lock.json .
RUN npm i --save-dev

COPY . .

RUN npm run eslint
RUN npm run build

CMD npm start

