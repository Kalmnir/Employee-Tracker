INSERT INTO department (name)
VALUES ('Sales'),
       ('Engineering'),
       ('Finance'),
       ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES ('Lead Engineer', 150000, 2),
       ('Legal Team Lead', 250000, 4),
       ('Acount Manager', 160000, 3),
       ('Sales Lead', 100000, 1),
       ('Accountant', 125000, 3),
       ('Sales Person', 80000, 1),
       ('Software Engineer', 120000, 2),
       ('Lawyer', 190000, 4);

INSERT INTO employee (first_name, last_name, manager_id, role_id)
VALUES ('John', 'Smith', null, 1),
       ('Jane', 'Doe', null, 2),
       ('Marcus', 'Aurelius', null, 3),
       ('Jean', "D'arc", null, 4),
       ('Alexander', 'Macedonia', 3, 5),
       ('Marvin', 'Martian', 4, 6),
       ('Bugs', 'Bunny', 1, 7),
       ('Ally', 'McBeal', 2, 8);