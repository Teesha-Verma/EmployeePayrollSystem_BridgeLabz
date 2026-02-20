const path=require("path");
const express=require("express");
const fs=require("fs").promises;
const app=express();
app.use(express.json())
const PORT=4500;

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

const readEmployeeFromFile=async()=>{
    const data = await fs.readFile("./employees.json","utf-8");
    return JSON.parse(data||"[]");
}

const writeEmployeeToFile=async(records)=>{
    await fs.writeFile("./employees.json",JSON.stringify(records,null,2));
};



app.get("/",async(req,res)=>{
    const emp= await readEmployeeFromFile();
    res.render("index", { employees: emp });
    //return res.status(200).json(emp);
})

app.get("/add", (req, res) => {
  res.render("add");
});

// app.get("/employee/:id", async (req, res) => {
//   try {
//     const userId = parseInt(req.params.id);

//     const employees = await readEmployeeFromFile();

//     const employee = employees.find(emp => emp.id === userId);

//     if (!employee) {
//       return res.status(404).json({
//         message: "Employee not found"
//       });
//     }

//     return res.status(200).json(employee);

//   } catch (error) {
//     return res.status(500).json({
//       message: "Server error",
//       error: error.message
//     });
//   }
// });


app.post("/register",async(req,res)=>{
  try{
  const employees= await readEmployeeFromFile();
  const user=req.body;
   if(!user||!user.id||!user.name||!user.gender||!user.department||!user.salary||!user.start_date){
    res.send("provide all details");
   }

   const ValidID=employees.find(emp=>emp.id===user.id);
   if(ValidID){
    res.send("ID already exist");
   }
   employees.push(user);
   await writeEmployeeToFile(employees);
   res.send("employee added");
   res.redirect("/");
  }catch{
    if(err){
      res.send("internal server error");
    }
  }

})

app.get("/edit/:id", async (req, res) => {
  const employees = await readEmployeeFromFile();
  const employee = employees.find(e => e.id == req.params.id);

  if (!employee) return res.send("Employee not found");

  res.render("edit", { employee });
});

app.post("/update/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.send("empty body not allowed")
    }

    const existingEmp = await readEmployeeFromFile();

    const foundIndex = existingEmp.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.send("employee not found");
    }

    existingEmp[foundIndex] = {
      ...existingEmp[foundIndex],
      ...req.body,
    };

    await writeEmployeeToFile(existingEmp);

    // return res.status(200).json({
    //   message: "Updated Successfully",
    //   student: existingEmp[foundIndex],
    // });
     res.redirect("/");
  } catch (err) {
    return res.send("internal server error");
  }
});


app.get("/delete/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const existingEmp = await readEmployeeFromFile();

    const foundIndex = existingEmp.findIndex((s) => s.id === userId);
    if (foundIndex === -1) {
      return res.send("employee not found");
    }

    existingEmp.splice(foundIndex, 1);

    await writeEmployeeToFile(existingEmp);

    // return res.status(200).json({
    //   message: "employee deleted successfully",
    //   deletedEmp: deletedEmp[0],
    // });
     res.redirect("/");
  } catch (err) {
    return res.send("internal srver error");
  }
});

app.listen(PORT,()=>{
    console.log("server is running on port 4500");
})
