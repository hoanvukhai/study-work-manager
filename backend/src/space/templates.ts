// Mẫu Không gian dựng sẵn: tạo Không gian kèm vài mục khởi đầu để người dùng bắt đầu nhanh.
// Chỉ là điểm khởi đầu — sau khi tạo, mọi thứ sửa / xoá tự do như mục bình thường.

export interface TemplateItem {
  key: string;
  type: 'TASK' | 'NOTE';
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedMinutes?: number;
}

export interface SpaceTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  goal?: string;
  items: TemplateItem[];
  /** [a, b] = việc a phụ thuộc việc b (b phải xong trước). */
  dependencies: [string, string][];
}

export const SPACE_TEMPLATES: SpaceTemplate[] = [
  {
    id: 'course',
    name: 'Môn học',
    description: 'Ghi chú bài giảng có thẻ ôn tập, bài tập và kế hoạch ôn thi.',
    icon: '📚',
    color: '#1a73e8',
    goal: 'Hoàn thành môn học với kết quả tốt',
    items: [
      {
        key: 'notes',
        type: 'NOTE',
        title: 'Ghi chú bài giảng',
        description:
          'Ghi nhanh các ý chính của buổi học ở đây.\n\nMẹo: mỗi thẻ ôn tập viết trên một dòng theo dạng "Câu hỏi :: Trả lời", rồi bấm "Tạo thẻ ôn tập":\n\nKhái niệm chính của chương 1 là gì? :: Viết định nghĩa ngắn gọn của bạn ở đây',
      },
      { key: 'read', type: 'TASK', title: 'Đọc giáo trình chương 1', priority: 'MEDIUM', estimatedMinutes: 90 },
      { key: 'exercise', type: 'TASK', title: 'Làm bài tập chương 1', priority: 'MEDIUM', estimatedMinutes: 120 },
      { key: 'midterm', type: 'TASK', title: 'Ôn tập giữa kỳ', priority: 'HIGH', estimatedMinutes: 240 },
      { key: 'final', type: 'TASK', title: 'Chuẩn bị thi cuối kỳ', priority: 'HIGH', estimatedMinutes: 480 },
    ],
    dependencies: [
      ['exercise', 'read'],
      ['final', 'midterm'],
    ],
  },
  {
    id: 'project',
    name: 'Đồ án / Dự án',
    description: 'Chuỗi công việc từ khảo sát đến báo cáo, mỗi bước chờ bước trước hoàn thành.',
    icon: '🎓',
    color: '#8b5cf6',
    goal: 'Hoàn thành dự án đúng hạn',
    items: [
      { key: 'log', type: 'NOTE', title: 'Nhật ký làm việc', description: 'Ghi lại quyết định, vấn đề gặp phải và cách giải quyết — sẽ rất hữu ích khi viết báo cáo.' },
      { key: 'survey', type: 'TASK', title: 'Khảo sát và xác định yêu cầu', priority: 'HIGH', estimatedMinutes: 480 },
      { key: 'design', type: 'TASK', title: 'Thiết kế hệ thống', priority: 'HIGH', estimatedMinutes: 720 },
      { key: 'build', type: 'TASK', title: 'Cài đặt', priority: 'HIGH', estimatedMinutes: 1800 },
      { key: 'test', type: 'TASK', title: 'Kiểm thử và sửa lỗi', priority: 'MEDIUM', estimatedMinutes: 480 },
      { key: 'report', type: 'TASK', title: 'Viết báo cáo', priority: 'MEDIUM', estimatedMinutes: 720 },
    ],
    dependencies: [
      ['design', 'survey'],
      ['build', 'design'],
      ['test', 'build'],
      ['report', 'test'],
    ],
  },
  {
    id: 'freelance',
    name: 'Khách hàng / Freelance',
    description: 'Quy trình nhận việc từ chốt yêu cầu đến bàn giao, kèm ghi chú trao đổi.',
    icon: '💼',
    color: '#f59e0b',
    goal: 'Bàn giao đúng hạn và hài lòng khách hàng',
    items: [
      { key: 'chat', type: 'NOTE', title: 'Trao đổi với khách hàng', description: 'Ghi lại yêu cầu, phản hồi và thoả thuận của khách để không bị thất lạc giữa các kênh.' },
      { key: 'scope', type: 'TASK', title: 'Chốt yêu cầu với khách', priority: 'HIGH', estimatedMinutes: 60 },
      { key: 'quote', type: 'TASK', title: 'Báo giá', priority: 'MEDIUM', estimatedMinutes: 45 },
      { key: 'work', type: 'TASK', title: 'Thực hiện', priority: 'HIGH', estimatedMinutes: 600 },
      { key: 'handover', type: 'TASK', title: 'Bàn giao và thu tiền', priority: 'HIGH', estimatedMinutes: 60 },
    ],
    dependencies: [
      ['quote', 'scope'],
      ['work', 'quote'],
      ['handover', 'work'],
    ],
  },
];

export function findTemplate(id: string): SpaceTemplate | undefined {
  return SPACE_TEMPLATES.find((t) => t.id === id);
}
