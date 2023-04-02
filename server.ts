import http from "http";
import uuid from "uuid";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { read_file, write_file } from "./fs_api/fs_api";

dotenv.config();

interface Course {
  id: string;
  title: string;
  price: number;
  author: string;
  userId: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}

let app = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });

  const course_id = req.url!.split("/")[2];
  if (req.method === "GET") {
    if (req.url === "/list") {
      let loggedUserId = req.headers.headers;

      console.log(loggedUserId);

      let courses = read_file("courses.json").filter((course: Course) => course.userId === loggedUserId);

      res.end(JSON.stringify(courses));
    }

    if (req.url === `/list/${course_id}`) {
      let oneCourse = read_file("courses.json").find((course: Course) => course.id === course_id);

      if (!oneCourse) return res.end("Course not found!");

      res.end(JSON.stringify(oneCourse));
    }
  }

  if (req.method === "POST") {
    if (req.url === "/create") {
      req.on("data", (chunk) => {
        let courses = read_file("courses.json");
        let new_course = JSON.parse(chunk.toString());

        courses.push({
          id: uuid.v4(),
          ...new_course,
        });

        write_file("courses.json", courses);

        res.end(JSON.stringify("OK"));
      });
    }

    if (req.url === "/register") {
      req.on("data", async (chunk) => {
        let { username, email, password } = JSON.parse(chunk.toString());

        let users = read_file("users.json");
        let foundedUser = users.find((u: User) => u.email === email);

        if (foundedUser)
          return res.end(
            JSON.stringify({
              msg: "Email already exists!!!",
            })
          );

        let hashedPsw = await bcrypt.hash(password, 12);

        users.push({
          id: uuid.v4(),
          username,
          email,
          password: hashedPsw,
        });

        write_file("users.json", users);
        res.end(
          JSON.stringify({
            msg: "Registrated!",
          })
        );
      });
    }

    if (req.url === "/login") {
      req.on("data", async (chunk) => {
        const { suppername, password } = JSON.parse(chunk.toString());

        let users = read_file("users.json");

        let foundedUser = users.find(
          (user: User) => user.username === suppername || user.email === suppername
        );

        if (!foundedUser)
          return res.end(
            JSON.stringify({
              msg: "User not found!",
            })
          );

        let isLogged = await bcrypt.compare(password, foundedUser.password);

        if (!isLogged)
          return res.end(
            JSON.stringify({
              msg: "Password xato!",
            })
          );

        delete foundedUser.password;
        res.end(
          JSON.stringify({
            msg: "Logged",
            data: foundedUser,
          })
        );
      });
    }
  }


    if (req.method === 'DELETE') {
        if (req.url === `/users/${userId}`) {
            let users: any[] = read_file('users.json');

            const getOne: any = users.find((u: any) => u.id === userId);

            if (!getOne) {
                return res.end('users not found!');
            }

            users.forEach((u: any, idx: number) => {
                if (u.id === userId) {
                    users.splice(idx, 1);
                }
            });

            write_file('users.json', users);
            res.end('Deleted users!');
        }
    }
    if (req.method === 'PUT') {
        if (req.url === `/users/${userId}`) {
            req.on('data', (chunk: Uint8Array) => {
                const updateUser: any = JSON.parse(chunk.toString());

                let users: any[] = read_file('users.json');

                const getOne: any = users.find((f: any) => f.id === userId);

                if (!getOne) {
                    return res.end('users not found!');
                }

                users.forEach((user: any) => {
                    if (user.id === userId) {
                        user.name = updateUser.name;
                        user.username = updateUser.username;
                        user.email = updateUser.email;
                    }
                });

                write_file('users.json', users);

                res.end('Updated users!');
            });
        }
    }
});

userApp.listen(PORT, () => {
    console.log(`server running ${PORT}`);
});
