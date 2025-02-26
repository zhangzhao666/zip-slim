declare module "*.worker.ts" {
  const Worker: {
    new (): Worker;
  };
  export default Worker;
}

declare module "*.worker" {
  const Worker: {
    new (): Worker;
  };
  export default Worker;
}
