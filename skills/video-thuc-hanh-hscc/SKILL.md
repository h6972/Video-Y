---
name: video-thuc-hanh-hscc
description: Video bài giảng thực hành Hồi sức (thở máy; sau mở rộng siêu âm POCUS, thủ thuật) có mô phỏng động chính xác, giọng Adam, dựng qua repo h6972/Video-Y. Quy trình đạo diễn → spec cảnh → subagent dựng → QA. Video guideline/case/bệnh học/sinh lý vẫn dùng video-bai-giang-y-khoa.
---

# Video thực hành HSCC (skill v2)

Phiên bản nâng cấp, tách riêng khỏi skill `video-bai-giang-y-khoa` (skill gốc giữ nguyên cho guideline, case, bệnh học, sinh lý). Skill này dành cho chủ đề mà người xem cần **thấy** hiện tượng: sóng máy thở, vòng P-V, bất đồng bộ; sau này siêu âm và thủ thuật.

Hạ tầng (repo, workflow dựng, giọng VieNeu **Adam**, thương hiệu **Thư Viện Y Khoa Online**, bài đăng FB/TikTok/YouTube, đưa lên web, lưu Project "Video Y Khoa") dùng **y hệt skill gốc**. Đọc SKILL.md của `video-bai-giang-y-khoa` nếu có trong phiên để lấy chi tiết các bước đó; ở đây chỉ ghi phần khác.

## Nguyên tắc cốt lõi
1. **Mô phỏng là nguồn số liệu.** Mọi con số được đọc lên (P đỉnh, P bình nguyên, ΔP, auto-PEEP, Vt…) phải lấy từ mô phỏng chạy thử, không ước lượng tay. Lời đọc và hình phải khớp.
2. **Hiện tượng phải tự xuất hiện từ vật lý**, không vẽ tay: muốn có auto-PEEP thì tăng R/giảm Te; muốn có gắng sức không hiệu quả thì cho bệnh nhân gắng sức yếu trên nền bẫy khí.
3. **Mỗi cảnh một ý**, đóng băng màn hình rồi đánh dấu từng chi tiết theo nhịp lời giảng.

## Quy trình 3 tầng (ý tưởng "Opus là bộ não, subagent thực thi")
**A. Đạo diễn (model chính tự làm).**
- Đọc tài liệu nguồn người dùng gửi (nếu có); nếu không có thì dựa kiến thức chuẩn (sinh lý cơ học hô hấp, khuyến cáo ARDS, COPD) và ghi rõ nguồn tham khảo ở `source_short`.
- Gửi dàn ý: 1 video 8–15 phút cho một chủ đề, hoặc loạt 3–6 phần. Mỗi cảnh ghi: mục tiêu học, thông số mô phỏng, hiện tượng cần thấy. Chờ duyệt.

**B. Spec cảnh (model chính).**
- Với mỗi cảnh `vent`/`loops`: chọn preset ở Knowledge Base bên dưới, chạy thử bằng harness Node (mục "Chạy thử mô phỏng") để lấy số thật, rồi mới viết `lines`.
- Định nhịp: `freeze` ở câu bắt đầu phân tích, `marks` rải theo từng câu (`"L2"`, `"L2+3"`), `changes` khi đổi thông số, `unfreeze` khi cho chạy lại.

**C. Dựng (subagent khi là loạt nhiều phần).**
- 1 video: tự viết `script.json` bằng script Python.
- Loạt nhiều phần và người dùng đồng ý: giao mỗi phần cho một subagent (Agent tool, model rẻ hơn như sonnet), prompt gồm: spec đã duyệt của phần đó, đường dẫn repo, yêu cầu đọc `engine/themes/_mau/may-tho.json` và mục Schema dưới đây, chạy build + stills, KHÔNG push. Model chính gom lại, kiểm tra, rồi mới push.

**D. QA (model chính hoặc một subagent kiểm tra độc lập).**
- `python3 engine/build.py projects/<dự án>` → `capture.py … stills` tại: 2 s sau mỗi `freeze`, sau mỗi mark cuối, cuối mỗi cảnh → contact sheet 2×2.
- Kiểm: nhãn mark không đè nhau hoặc đè sóng; số trong bảng số khớp lời đọc; sóng không tràn khung (chỉnh `scale`); toast không che nhãn; phụ đề không che nội dung.
- Sau đó commit + push, theo dõi run, tải mp4, kiểm tra thời lượng/âm lượng, gửi người dùng (như skill gốc).

## Theme `may-tho` (engine/themes/may-tho)
Giao diện màn hình máy thở ICU: Paw vàng, lưu lượng xanh ngọc, thể tích tím; cột phải có phổi động (đỏ khi Pplat > 30 hoặc auto-PEEP > 2), bảng số, ghi chú. Dùng chung được các layout `title`, `list`, `summary`, `cards`, `compare`, `box`, `quiz`, `timeline` của khung chung.

### Layout `vent`
- `vent{}`: thông số mô phỏng
  - `mode`: `VC` | `PC` | `PS`
  - VC: `vt` (mL), `ti` (s, thời gian có lưu lượng), `pause` (s), `flow`: `square` | `decel`
  - PC: `pi` (áp lực trên PEEP), `ti`; PS: `ps`, `cyc` (% lưu lượng đỉnh để chuyển thì, mặc định 25)
  - chung: `rr`, `peep`, `R` (cmH₂O/L/s), `Rexp` (mặc định = R), `C` (mL/cmH₂O), `rise` (s), `fio2` (chỉ hiển thị)
  - bệnh nhân: `effort` (biên độ Pmus, cmH₂O; 0 = an thần hoàn toàn), `rrp` (tần số gắng sức), `tin` (thời gian hít vào thần kinh, s), `trig` (ngưỡng trigger L/phút), `phase`
- `changes[]`: `{at, set:{…}, label, c, hold}`; thông số mới áp dụng từ nhịp kế tiếp; `label` hiện thành toast ⚙.
- `freeze`, `unfreeze`: mốc thời gian (như `at`). Khi đóng băng, marks đánh trên nhịp hoàn chỉnh gần nhất (kết thúc trước mốc freeze ≥ 0,5 s).
- `marks[]`: `{k, at, c, t(nhãn tuỳ chọn), breath(-1 mặc định, -2 là nhịp trước nữa)}`; `k`:
  `ppeak`, `pplat`, `peep`, `dp` (ΔP), `res` (P đỉnh − Pplat), `ti`, `te`, `vt`, `autopeep` (lưu lượng cuối thở ra ≠ 0), `ineff` (gắng sức không trigger trong cửa sổ), `pt` (điểm tự do: `strip` P|F|V, `dt` giây tính từ đầu nhịp, `y`, `dx`, `dy`, `anc`).
  Marks chỉ dùng khi có `freeze`, đặt `at` sau mốc freeze.
- `nums[]` (tối đa 6, 3 cột): `ppeak`, `pplat`, `dp`, `peep`, `peeptot`, `autopeep`, `vt`, `rr`, `mv`, `crs`.
- `alarm{}`: ngưỡng tô đỏ, ví dụ `{"pplat":30,"dp":15,"autopeep":2}`.
- `notes[]` (≤ 2): `{tag,t,c,at}`. `lung:false` để bỏ hình phổi. `showPmus:true` vẽ Pmus (nét đứt đỏ) trên dải áp lực. `win` (s) cửa sổ hiển thị (mặc định ≈ 2,6 nhịp). `scale{p:[a,b],f:[a,b],v:[a,b]}` để cố định thang.

### Layout `loops`
Cùng `vent{}`, `changes`, `freeze`, `nums`, `notes`; hiện vòng P-V và F-V (nhịp hiện tại sáng, 2 nhịp trước mờ). `points[]`: `{plot:'pv'|'fv', x, y (đơn vị dữ liệu), t, c, at, dx, dy}` để chỉ điểm (mỏ chim quá căng, vòng F-V không khép).

### Title
`layout: title` tự thay hình minh hoạ thành màn hình 3 đường sóng.

## Knowledge Base thở máy (preset đã chạy thử)
| Tình huống | `vent` | Kết quả mô phỏng |
|---|---|---|
| Bình thường VC | `{vt:450,rr:16,ti:1,pause:0.3,peep:5,R:10,C:50}` | P đỉnh 19, Pplat 14, ΔP 9 |
| Phổi cứng (ARDS) | như trên, `C:20` | P đỉnh 32, Pplat 28, ΔP 23 |
| Tắc ống / co thắt | như trên, `R:40` | P đỉnh 36, Pplat 14 không đổi (chênh lớn) |
| COPD bẫy khí | `{vt:500,rr:24,ti:1,pause:0.2,R:25,C:60}` | auto-PEEP 6; giảm `rr` 12 → hết |
| Gắng sức không hiệu quả | `{R:25,C:60,rr:14,vt:600,ti:1.2,pause:0,effort:4,rrp:26}` | ~6 gắng sức không trigger/20 s, mark `ineff` |
| Double trigger | `{vt:350,ti:0.6,pause:0,rr:12,effort:12,rrp:15,tin:1.8,R:8,C:45}` | cặp nhịp cách 0,8 s, nhịp chồng P đỉnh 24 |
| Đói lưu lượng | `{vt:450,ti:1.2,pause:0,rr:12,effort:12,rrp:18,tin:1}` + `showPmus:true` | sóng áp lực lõm thì hít vào |
| PS | `{mode:'PS',ps:10,peep:5,effort:6,rrp:20}` | bệnh nhân tự trigger 20 l/ph, Vt ~490 |
| PC | `{mode:'PC',pi:15,rr:15,ti:1,R:10,C:45}` | Vt ~600, lưu lượng giảm dần |

Khi đổi thông số, luôn chạy thử lại, không suy số từ bảng.

### Chạy thử mô phỏng (Node)
```js
// /tmp/.../h.js — node h.js
const fs=require('fs');
global.L={title:s=>''};global.at=v=>v==null?'0':(typeof v==='number'?'L'+v:v);global.esc=s=>String(s??'');global.C=c=>'c-'+(c||'teal');
global.parseT=(v,sc)=>{v=String(v);const m=v.match(/^L(\d+)([+-][\d.]*)?$/);if(m)return sc.L[+m[1]].t0+(m[2]?parseFloat(m[2]):0);return parseFloat(v)};global.window={};
eval(fs.readFileSync('<repo>/engine/themes/may-tho/layouts.js','utf8')+';global.ventSim=ventSim');
const S=ventSim({L:[{t0:0}],dur:20,vent:{/* thông số */}});
S.br.filter(b=>b.t0>2).forEach(b=>console.log(b.trig,b.ppeak.toFixed(1),b.pplat,b.vt.toFixed(0),b.auto.toFixed(1),b.fEnd.toFixed(1)));
```
Trường mỗi nhịp: `t0, trig ('may'|'bn'), ppeak, pplat, vt, auto (auto-PEEP), fEnd (L/phút cuối thở ra), peep`. `S.eff`: gắng sức không trigger.

## Lời giảng
- Như skill gốc: "Thưa quý đồng nghiệp", giải thích vì sao, nhấn bẫy thực hành, 1 tình huống "Quý vị có thể tạm dừng video để suy nghĩ." (layout `quiz`), kết thúc bằng tổng kết và câu chào Thư Viện Y Khoa Online.
- Mỗi cảnh mô phỏng: câu 1 mô tả bối cảnh, câu 2 "ta đóng băng màn hình", các câu sau đọc từng chi tiết đúng lúc mark hiện.
- Script: `theme:"may-tho"`, `subtitle:"Thở máy thực hành"`, `part:"Thở máy · Phần N/M"`.
- Lexicon gợi ý: `{"PEEP":"píp","auto-PEEP":"ô tô píp","Pplat":"pê bình nguyên","Vt":"vê tê","FiO₂":"phi ô hai","COPD":"bệnh phổi tắc nghẽn mạn tính","ARDS":"suy hô hấp cấp tiến triển"}` (sắp khoá dài trước; viết lời đọc ưu tiên chữ đầy đủ).

## Mở rộng (chưa xây, làm khi người dùng yêu cầu)
- **Siêu âm (theme `sieu-am`)**: hình thật phải là clip của người dùng đã ẩn danh hoàn toàn (không tên, mã, ngày); skill chèn clip + chú thích, mũi tên, đo đạc động; mô hình đầu dò trên thân người và mặt cắt qua tim/phổi bằng SVG/Three.js. Không dùng hình siêu âm do AI tạo để dạy chẩn đoán.
- **Thủ thuật (theme `thu-thuat`)**: giải phẫu mốc + từng bước (Seldinger, đặt NKQ, chọc dịch), checklist dụng cụ, biến chứng; có thể chèn clip thật của người dùng.
- Xây theo cùng mẫu theme: `engine/themes/<tên>/{theme.css,layouts.js}` + `_mau/<tên>.json`, mô phỏng tất định theo thời gian `render(t)` (không dùng Math.random / thời gian thực).

## Lưu ý
- Không yêu cầu API key/token trong chat. Người dùng dùng Windows, repo trên máy ở `D:\Video-Y`.
- Video mẫu đầu tiên: `projects/may-tho-demo` (đọc sóng máy thở cơ bản).
