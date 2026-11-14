const RANKS = [
  { minimumPercentage: 95, rank: 'Lore Keeper' },
  { minimumPercentage: 80, rank: 'Jedi Master' },
  { minimumPercentage: 60, rank: 'Jedi Knight' },
  { minimumPercentage: 40, rank: 'Padawan' },
  { minimumPercentage: 0, rank: 'Youngling' },
];

export class RankService {
  static calculate(score, total) {
    if (
      !Number.isInteger(score) ||
      !Number.isInteger(total) ||
      score < 0 ||
      total < 0 ||
      score > total
    ) {
      throw new RangeError('Score and total must be non-negative integers, with score no greater than total.');
    }

    const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
    const { rank } = RANKS.find(({ minimumPercentage }) => percentage >= minimumPercentage);

    return { percentage, rank };
  }
}
