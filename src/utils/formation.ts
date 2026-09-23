import type { LineupPlayer } from "../types";

/**
 * Suy ra chuỗi đội hình (vd: "2-3-1") từ danh sách cầu thủ.
 * - Bỏ qua thủ môn (GK).
 * - Gom nhóm các cầu thủ có tọa độ x xấp xỉ nhau (cùng 1 hàng ngang trên sân).
 * - Sắp xếp các hàng theo x TĂNG dần trước, sau đó đảo ngược lại để số đầu
 *   tiên trong chuỗi luôn là hàng TẤN CÔNG (x lớn, xa GK) và số cuối cùng
 *   là hàng PHÒNG NGỰ (x nhỏ, gần GK) — khớp chiều applyFormation bên dưới.
 *
 * @param players danh sách cầu thủ hiện tại
 * @param tolerance sai số tọa độ x cho phép để coi là "cùng hàng" (mặc định 3)
 */
export function getFormation(players: LineupPlayer[], tolerance = 3): string {
  const gk = players.find((p) => p.position === "GK");
  const outfield = players.filter((p) => p.position !== "GK");
  if (outfield.length === 0) return gk ? "1" : "";

  // sort theo x tăng dần: gần GK (phòng ngự) -> xa GK (tấn công)
  const sorted = [...outfield].sort((a, b) => a.x - b.x);

  const rows: { x: number; count: number }[] = [];
  for (const p of sorted) {
    const lastRow = rows[rows.length - 1];
    if (lastRow && Math.abs(p.x - lastRow.x) <= tolerance) {
      lastRow.count += 1;
    } else {
      rows.push({ x: p.x, count: 1 });
    }
  }

  // "1" đại diện GK, luôn đứng đầu chuỗi, không đảo ngược nữa
  return ["1", ...rows.map((r) => r.count)].join("-");
}


export interface ApplyFormationOptions {
  gkX?: number;
  startX?: number;
  endX?: number;
  yMargin?: number;
}


/**
 * Áp 1 chuỗi đội hình (vd: "3-2-1") vào danh sách cầu thủ hiện tại,
 * tính lại tọa độ x, y cho từng cầu thủ để khớp với đội hình mới.
 *
 * Quy ước:
 * - Số ĐẦU TIÊN trong chuỗi = hàng TẤN CÔNG, xa GK nhất (x = endX).
 * - Số CUỐI CÙNG trong chuỗi = hàng PHÒNG NGỰ, gần GK nhất (x = startX).
 * - GK giữ nguyên ở x = gkX, y = 50.
 * - Trong mỗi hàng, cầu thủ trải đều theo y giữa [yMargin, 100 - yMargin].
 *
 * @param players danh sách cầu thủ hiện tại
 * @param formation chuỗi đội hình, vd "3-2-1" (không tính GK)
 */
export function applyFormation(
  players: LineupPlayer[],
  formation: string,
  options: ApplyFormationOptions = {},
): LineupPlayer[] {
  const { gkX = 10, startX = 25, endX = 85, yMargin = 12 } = options;

  const rawGroups = formation
    .split("-")
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n) && n > 0);

  if (rawGroups.length === 0) return players;

  // Số đầu tiên luôn là GK -> bỏ ra, không tính vào layout outfield
  const groups = rawGroups.slice(1);

  const gk = players.find((p) => p.position === "GK");
  const outfield = players.filter((p) => p.position !== "GK");

  const totalNeeded = groups.reduce((sum, n) => sum + n, 0);
  if (totalNeeded !== outfield.length) {
    console.warn(
      `applyFormation: formation "${formation}" cần ${totalNeeded} cầu thủ (không tính GK) ` +
        `nhưng danh sách có ${outfield.length} cầu thủ ngoài GK.`,
    );
  }

  const result: LineupPlayer[] = [];
  if (gk) result.push({ ...gk, x: gkX, y: 50 });
  if (groups.length === 0) return [...result, ...outfield];

  const stepX = groups.length > 1 ? (endX - startX) / (groups.length - 1) : 0;

  const layoutY = (index: number, count: number): number => {
    if (count === 1) return 50;
    const usable = 100 - yMargin * 2;
    return yMargin + (usable * index) / (count - 1);
  };

  // Cắt outfield TUẦN TỰ theo đúng số lượng mỗi hàng - không cần quan tâm vị trí cũ
  let idx = 0;
  groups.forEach((count, lineIndex) => {
    // lineIndex 0 = hàng gần GK nhất (phòng ngự, x nhỏ)
    // lineIndex cuối = hàng xa GK nhất (tấn công, x lớn)
    const x = groups.length > 1 ? startX + stepX * lineIndex : startX;

    for (let i = 0; i < count; i++) {
      const player = outfield[idx];
      idx++;
      if (!player) return;
      result.push({ ...player, x, y: layoutY(i, count) });
    }
  });

  while (idx < outfield.length) {
    result.push(outfield[idx]);
    idx++;
  }

  return result;
}