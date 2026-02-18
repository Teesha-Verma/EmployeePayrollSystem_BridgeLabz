const express=require("express");
const fs=require("fs").promises;
const app=express();
app.use(express.json())
const PORT=4500;

// const employee=[
//    {name:"annu don", gender:"male", department:"hr", salary:"$6784", start_date:"7 jul 2024"}
// ]

const readEmployeeFromFile=async()=>{
    const data = await fs.readFile("./employees.json","utf-8");
    return JSON.parse(data||"[]");
}

const writeEmployeeToFile=async(records)=>{
    await fs.writeFile("./employees.json",JSON.stringify(records,null,2));
};


app.get("/",async(req,res)=>{
    const emp= await readEmployeeFromFile();
    return res.status(200).json(emp);
})

app.get("/employee/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const employees = await readEmployeeFromFile();

    const employee = employees.find(emp => emp.id === userId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    return res.status(200).json(employee);

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});


app.post("/register", async(req,res)=>{
    try{
        const emp=await readEmployeeFromFile();
        const user=req.body;

        if(!user||!user.id||!user.name||!user.gender||!user.department||!user.salary||!user.start_date){
            return res.status(400).send("please provide all information")
        }

        const validID=emp.find(emp=>emp.id===user.id)
            if(validID){
                return res.status(409).send("id already existed");
            }

        emp.push(user);
        await writeEmployeeToFile(emp);
        res.status(201).json({
            message:"employee registered successfully",
            emp:user
        });
    }
    catch(error){
        res.status(500).send("server error");
    }

})

app.put("/update/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Empty body not allowed" });
    }

    const existingEmp = await readEmployeeFromFile();

    const foundIndex = existingEmp.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.status(404).send("employee not found");
    }

    existingEmp[foundIndex] = {
      ...existingEmp[foundIndex],
      ...req.body,
    };

    await writeEmployeeToFile(existingEmp);

    return res.status(200).json({
      message: "Updated Successfully",
      student: existingEmp[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});


app.delete("/delete/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const existingEmp = await readEmployeeFromFile();

    const foundIndex = existingEmp.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.status(404).send("employee not found");
    }

    const deletedEmp = existingEmp.splice(foundIndex, 1);

    await writeEmployeeToFile(existingEmp);

    return res.status(200).json({
      message: "employee deleted successfully",
      deletedEmp: deletedEmp[0],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

app.listen(PORT,()=>{
    console.log("server is running on port 4500");
})
