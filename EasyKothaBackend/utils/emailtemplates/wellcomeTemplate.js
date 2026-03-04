export const welcomeTemplate = ({ name = "User", loginUrl = "http://localhost:5173/login" } = {}) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif">
	<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
		<tr>
			<td align="center" style="padding:24px 12px">
				<table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden">
					<tr>
						<td style="background:#166534;color:#ffffff;padding:18px;text-align:center">
							<h2 style="margin:0;font-size:24px">Welcome to Easy Kotha 🎉</h2>
						</td>
					</tr>

					<tr>
						<td style="padding:24px;color:#1f2937;font-size:15px;line-height:1.7">
							<p style="margin:0 0 12px 0">Hi <b>${name}</b>,</p>
							<p style="margin:0 0 12px 0">Your account has been created successfully. You can now explore verified rentals, connect with landlords, and manage bookings with ease.</p>
							<p style="margin:0 0 18px 0">Click the button below to login and get started.</p>

							<p style="margin:0 0 8px 0;text-align:center">
								<a href="${loginUrl}" style="display:inline-block;background:#166534;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">
									Login to Easy Kotha
								</a>
							</p>
						</td>
					</tr>

					<tr>
						<td style="background:#ecfdf3;color:#4b5563;padding:14px;text-align:center;font-size:12px">
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

export const wellcomeTemplate = welcomeTemplate;
