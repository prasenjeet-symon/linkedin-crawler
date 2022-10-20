import { Chance } from "chance";

export const delay_time = () => {
  const delays = [100, 200, 50, 400, 300, 150, 120, 110, 90, 70, 35];
  const chance = new Chance();
  return chance.pickone(delays);
};

// delay code execution
export async function delayExecution(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("next");
    }, ms);
  });
}
