async (page) => {
  await page.waitForTimeout(2500);

  const claimInput = page.getByRole("textbox", {
    name: "Paste or type a factual claim",
    exact: true,
  });
  await claimInput.press("Enter");

  await page.getByText("CASE ENGINE ACTIVE", { exact: true }).waitFor({
    state: "visible",
    timeout: 10000,
  });
  await page.waitForTimeout(3000);

  const reportTabs = page.getByRole("tablist", {
    name: "Case report sections",
    exact: true,
  });
  await reportTabs.waitFor({ state: "visible", timeout: 120000 });
  await page.waitForTimeout(3200);

  await page.getByRole("tab", { name: /Evidence/ }).click();
  await page.waitForTimeout(3200);

  await page.getByRole("tab", { name: /Agents/ }).click();
  await page.waitForTimeout(3600);

  await page.getByRole("tab", { name: /Audit/ }).click();
  await page.waitForTimeout(3600);

  await page.getByRole("tab", { name: /Overview/ }).click();
  await page.waitForTimeout(2600);

  await page.getByRole("button", { name: "Download Proof Card", exact: true }).click();
  await page.waitForTimeout(2200);
}
