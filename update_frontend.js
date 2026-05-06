const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const oldSubmitForm = `        function submitForm() {
            const levelData = LEVEL_DATA[selectedLevel];
            const submission = {
                userName: document.getElementById("userName").value,
                company: document.getElementById("company").value,
                level: levelData ? levelData.fullName : "",
                condition: selectedCondition >= 0 && levelData ? levelData.conditions[selectedCondition] : "",
                certName: document.getElementById("certName") ? document.getElementById("certName").value : "",
                certNumber: document.getElementById("certNumber") ? document.getElementById("certNumber").value : "",
                majorName: document.getElementById("majorName") ? document.getElementById("majorName").value : "",
                submitTime: new Date().toLocaleString("zh-CN")
            };
            submissions.push(submission);
            saveData();
            
            document.getElementById("successName").textContent = submission.userName;
            document.getElementById("successLevel").textContent = submission.level;
            document.getElementById("successTime").textContent = submission.submitTime;
            
            currentStep = 5;
            updateStepper();
            showStep(5);
            showToast("报名信息提交成功！", "success");
        }`;

const newSubmitForm = `        async function submitForm() {
            const levelData = LEVEL_DATA[selectedLevel];
            const submission = {
                userName: document.getElementById("userName").value,
                company: document.getElementById("company").value,
                level: levelData ? levelData.fullName : "",
                condition: selectedCondition >= 0 && levelData ? levelData.conditions[selectedCondition] : "",
                certName: document.getElementById("certName") ? document.getElementById("certName").value : "",
                certNumber: document.getElementById("certNumber") ? document.getElementById("certNumber").value : "",
                majorName: document.getElementById("majorName") ? document.getElementById("majorName").value : ""
            };

            try {
                const response = await fetch("/api/submit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(submission)
                });

                if (!response.ok) {
                    throw new Error("提交失败");
                }

                submissions.push(submission);
                saveData();
                
                document.getElementById("successName").textContent = submission.userName;
                document.getElementById("successLevel").textContent = submission.level;
                document.getElementById("successTime").textContent = new Date().toLocaleString("zh-CN");
                
                currentStep = 5;
                updateStepper();
                showStep(5);
                showToast("报名信息提交成功！", "success");
            } catch (error) {
                showToast("提交失败，请稍后重试", "error");
            }
        }`;

const oldExportExcel = `        function exportExcel() {
            if (!isAdminLoggedIn) {
                showToast("请先登录管理员", "warning");
                return;
            }
            if (!submissions || submissions.length === 0) {
                showToast("没有可导出的报名数据", "warning");
                return;
            }
            
            try {
                const worksheetData = [
                    ["姓名", "工作单位", "报考等级", "符合条件", "证书/职称名称", "证书/职称编号", "专业或相关专业名称", "提交时间"]
                ];
                
                submissions.forEach(s => {
                    worksheetData.push([
                        s.userName || "",
                        s.company || "",
                        s.level || "",
                        s.condition || "",
                        s.certName || "",
                        s.certNumber || "",
                        s.majorName || "",
                        s.submitTime || ""
                    ]);
                });
                
                const ws = XLSX.utils.aoa_to_sheet(worksheetData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "报名数据");
                
                const dateStr = new Date().toISOString().slice(0, 10);
                XLSX.writeFile(wb, "人工智能训练师报名数据_" + dateStr + ".xlsx");
                showToast("导出成功", "success");
            } catch (e) {
                console.error(e);
                showToast("导出失败", "error");
            }
        }`;

const newExportExcel = `        async function exportExcel() {
            if (!isAdminLoggedIn) {
                showToast("请先登录管理员", "warning");
                return;
            }

            try {
                window.location.href = "/api/export";
            } catch (e) {
                console.error(e);
                showToast("导出失败", "error");
            }
        }`;

content = content.replace(oldSubmitForm, newSubmitForm);
content = content.replace(oldExportExcel, newExportExcel);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Frontend code updated successfully');
