export const baseTemplate = ({ title, body }) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial">
  <table width="100%">
    <tr>
      <td align="center" style="padding:20px">
        <table width="600" style="background:#fff;border-radius:8px">
          
          <tr>
            <td style="background:#2563eb;color:#fff;padding:16px;text-align:center">
              <h2 style="margin:0">Easy Kotha</h2>
            </td>
          </tr>

          <tr>
            <td style="padding:20px;color:#333">
              <h3>${title}</h3>
              <p style="line-height:1.6">${body}</p>
            </td>
          </tr>

          <tr>
            <td style="background:#f4f6f8;padding:12px;text-align:center;font-size:12px">
              © ${new Date().getFullYear()} Easy Kotha. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
