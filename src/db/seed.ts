import { faker } from '@faker-js/faker'
import { db } from './index'
import { analysisFindings, submissions } from './schemas'

const ROAST_MODES = ['honest', 'roast'] as const

const SEVERITIES = ['critical', 'warning', 'good'] as const

const ROAST_TITLES = [
  'Variável mal nomeada',
  'Lógica desnecessariamente complexa',
  'Falta de tratamento de erro',
  'Performance questionável',
  'Code duplication',
  'Magic numbers everywhere',
  'Função muito grande',
  'Falta de testes',
  'Arquitetura confusa',
  'Segurança comprometida',
  'Indentação inconsistente',
  'Comentários desatualizados',
  'Import não utilizado',
  'Tipo genérico em demasia',
  'Loop infinito potencial',
  'Memory leak detectado',
  'Race condition provável',
  'SQL injection risk',
  'XSS vulnerability',
  'CORS headers ausentes',
]

const ROAST_DESCRIPTIONS = [
  'Este código parece ter sido escrito enquanto dormia. Considere usar um naming convention.',
  'A complexidade ciclomática deste algoritmo é maior que a população de uma cidade média.',
  'Sem tratamento de erro, este código vai quebrar tão rápido quanto um vidro em um furacão.',
  'Se performance fosse uma corrida, este código estaria a pé enquanto outros estão em um foguete.',
  'Você copiou e colou esse código tanta vez que até o Git desistiu de contar.',
  'Magic numbers? Mais como números de magia negra que ninguém consegue entender.',
  'Esta função é tão grande que precisa de um mapa para navegar pelo código.',
  'Sem testes unitários, você está confiando na sorte. E a sorte não é um strategy bom.',
  'A arquitetura aqui parece ter sido desenhada por alguém com os olhos fechados.',
  'As vulnerabilidades de segurança aqui são tão óbvias que até um script kiddie enxergaria.',
  'A indentação está mais confusa que GPS em um túnel subterrâneo.',
  'Os comentários aqui são tão desatualizados quanto notícias do século passado.',
  'Você está importando algo que nunca usa? Limpe isso.',
  'Genéricos demais. Nem o TypeScript consegue entender o que está acontecendo.',
  'Esse loop pode rodar para sempre. Boa sorte parando ele sem Force Kill.',
  'Memory leak detectado: este código perde memória tão rápido quanto furo em balde.',
  'Race conditions esperando para acontecer. O timing é tudo, e aqui é nada.',
  'SQL injection é um convite aberto para hackers. Você deixou a porta da frente aberta.',
  'XSS vulnerability: você está executando JavaScript não validado no navegador.',
  'CORS headers ausentes = violação de segurança em produção.',
]

const ROAST_TEXTS = [
  'Parabéns, você conseguiu transformar um problema simples numa obra de arte do caos. Cada linha grita por refatoração e os futuros mantenedores já estão sofrendo.',
  'Esse código funciona por acidente, não por design. Qualquer alteração vai derrubar tudo como dominó, e você vai ser o culpado.',
  'Você claramente descobriu o Stack Overflow ontem. Infelizmente, copiou as respostas erradas — as que tinham 3 votos negativos.',
  'A ausência de tratamento de erro aqui é uma declaração filosófica: "se quebrar, é problema de quem executar". Corajoso, mas irresponsável.',
  'Esse SQL é um convite escrito em néon para qualquer hacker mediano. Você basicamente deixou a chave debaixo do tapete e o tapete no GitHub.',
  'Variáveis chamadas `data`, `info` e `stuff` num mesmo arquivo é o equivalente a etiquetar gavetas com "coisas", "mais coisas" e "outras coisas".',
  'A função tem 200 linhas, faz 12 coisas diferentes e tem um comentário dizendo "// TODO: refactor". Esse TODO está aqui há 3 anos.',
  'Usar `eval` pra isso é como usar uma bazuca para matar um mosquito — funciona, mas o dano colateral é inaceitável.',
  'Você reinventou a roda, mas quadrada. Existe uma função nativa que faz exatamente isso em uma linha, mas você escreveu 40.',
  'Esse código tem mais `!important` do que regras CSS de verdade. A especificidade foi embora e levou a manutenibilidade junto.',
  'O `catch` silencioso aqui é magistral: quando algo quebrar em produção, você não vai saber. Nunca. Isso é design de terror.',
  'Hardcodar senha em código-fonte é um clássico. Espero que esse repositório seja privado. É privado, né? Né?',
  'Três loops aninhados para filtrar uma lista de 10 itens. O Big O desse algoritmo faz os processadores chorarem.',
  'Você usou `any` no TypeScript 7 vezes em 20 linhas. Nesse ponto, por que não voltar para JavaScript e ser honesto consigo mesmo?',
  'O código funciona na sua máquina porque você nunca testou edge cases. Em produção, usuários vão encontrar todos eles.',
  'Esse Dockerfile instala tudo como root, expõe credenciais via ENV e usa `latest` em tudo. Um pentest ia adorar isso.',
  'A lógica aqui é tão circular que demorei 3 leituras pra entender que não faz nada além do que já tinha antes.',
  'Cada vez que você usa `!` para forçar unwrap em Swift, um engenheiro sênior perde um fio de cabelo.',
  'Esse script bash deletaria arquivos críticos em produção sem confirmação. Espero que você nunca rode isso com as permissões erradas.',
  'Race condition clássica: dois threads acessando o mesmo recurso sem lock. Às vezes funciona. Às vezes não. Boa sorte em produção.',
  'O código até compila, o que já é mais do que eu esperava. Isso não significa que está correto — significa que o compilador desistiu de te julgar.',
  'Você claramente confunde "funciona no meu computador" com "está correto". São coisas muito diferentes, como vou te mostrar.',
  'Esse tipo genérico tem 4 camadas de indireção. Nem o TypeScript Language Server consegue inferir o tipo final sem reiniciar.',
  'Colocar lógica de negócio, acesso a banco e formatação de resposta na mesma função de 150 linhas é a antítese de SRP.',
  'A password está em MD5. MD5. Em 2024. Vou precisar de um momento para processar isso.',
]

type Snippet = { code: string; lang: string }

const SNIPPETS: Snippet[] = [
  // JavaScript
  {
    lang: 'javascript',
    code: `var data = eval(prompt("enter code to run"));
console.log(data);`,
  },
  {
    lang: 'javascript',
    code: `function add(a, b) {
  return a + b;
}
function subtract(a, b) {
  return a - b;
}
function multiply(a, b) {
  return a * b;
}
function divide(a, b) {
  return a / b;
}`,
  },
  {
    lang: 'javascript',
    code: `var x = 1;
if (x == true) {
  return true;
} else if (x == false) {
  return false;
} else {
  return !false;
}`,
  },
  {
    lang: 'javascript',
    code: `setTimeout(function() {
  setTimeout(function() {
    setTimeout(function() {
      setTimeout(function() {
        doSomething();
      }, 1000);
    }, 1000);
  }, 1000);
}, 1000);`,
  },
  {
    lang: 'javascript',
    code: `function getUser(id) {
  var user = null;
  $.ajax({
    url: '/api/users/' + id,
    success: function(data) { user = data; }
  });
  return user; // always null
}`,
  },
  {
    lang: 'javascript',
    code: `document.getElementById('root').innerHTML = '<h1>' + req.query.name + '</h1>';`,
  },

  // TypeScript
  {
    lang: 'typescript',
    code: `function fetchData(url: any): any {
  return fetch(url).then((r: any) => r.json() as any);
}`,
  },
  {
    lang: 'typescript',
    code: `interface User {
  data: any;
  info: any;
  stuff: any;
  things: any;
}`,
  },
  {
    lang: 'typescript',
    code: `const result = (someValue as any) as string;
console.log(result.toUpperCase());`,
  },
  {
    lang: 'typescript',
    code: `type ID = string | number | null | undefined | object | any[];

function getById(id: ID) {
  // @ts-ignore
  return db.find(id);
}`,
  },
  {
    lang: 'typescript',
    code: `// TODO: add types later
export default function handler(req, res) {
  const { q } = req.query;
  res.send(\`<script>alert('\${q}')</script>\`);
}`,
  },

  // Python
  {
    lang: 'python',
    code: `password = "admin123"
admin_password = "admin123"
real_password = "admin123"

def check_password(p):
    return p == "admin123"`,
  },
  {
    lang: 'python',
    code: `import os

def run_command(user_input):
    os.system("ls " + user_input)`,
  },
  {
    lang: 'python',
    code: `def get_all_users():
    users = []
    for i in range(1, 999999):
        users.append(db.query(f"SELECT * FROM users WHERE id = {i}"))
    return users`,
  },
  {
    lang: 'python',
    code: `try:
    do_something()
except:
    pass`,
  },
  {
    lang: 'python',
    code: `l = [1,2,3,4,5]
ll = [x for x in l]
lll = [x*2 for x in ll]
llll = [str(x) for x in lll]
print(llll)`,
  },
  {
    lang: 'python',
    code: `def is_even(n):
    if n % 2 == 0:
        return True
    else:
        return False`,
  },

  // Java
  {
    lang: 'java',
    code: `public class Main {
    public static void main(String[] args) {
        String s = null;
        if (s.equals("hello")) {
            System.out.println("hello");
        }
    }
}`,
  },
  {
    lang: 'java',
    code: `public static String getUserById(int id) {
    try {
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE id = " + id);
        return rs.getString("name");
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}`,
  },
  {
    lang: 'java',
    code: `for (int i = 0; i < list.size(); i++) {
    for (int j = 0; j < list.size(); j++) {
        for (int k = 0; k < list.size(); k++) {
            System.out.println(list.get(i) + list.get(j) + list.get(k));
        }
    }
}`,
  },
  {
    lang: 'java',
    code: `public class Singleton {
    private static Singleton instance;
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton(); // not thread-safe
        }
        return instance;
    }
}`,
  },

  // C++
  {
    lang: 'cpp',
    code: `int* createArray() {
    int arr[100];
    return arr; // returning pointer to stack memory
}`,
  },
  {
    lang: 'cpp',
    code: `char buf[8];
printf("Enter name: ");
gets(buf); // no bounds checking`,
  },
  {
    lang: 'cpp',
    code: `void leak() {
    int* p = new int[1000];
    // forgot delete[] p
}

int main() {
    while (true) leak();
}`,
  },
  {
    lang: 'cpp',
    code: `using namespace std;

int a, b, c, d, e, f, g;

int main() {
    cin >> a >> b >> c >> d >> e >> f >> g;
    cout << a+b+c+d+e+f+g << endl;
}`,
  },

  // C#
  {
    lang: 'csharp',
    code: `public string GetUser(string id) {
    string query = "SELECT * FROM Users WHERE Id = " + id;
    return db.ExecuteScalar(query).ToString();
}`,
  },
  {
    lang: 'csharp',
    code: `catch (Exception ex)
{
    // TODO: handle this
    Console.WriteLine(ex);
}`,
  },
  {
    lang: 'csharp',
    code: `public class God {
    public void HandleLogin() { }
    public void SendEmail() { }
    public void GeneratePDF() { }
    public void ProcessPayment() { }
    public void ResizeImage() { }
    public void ParseCSV() { }
}`,
  },
  {
    lang: 'csharp',
    code: `var result = "";
for (int i = 0; i < 10000; i++) {
    result += i.ToString(); // O(n²) string allocation
}`,
  },

  // PHP
  {
    lang: 'php',
    code: `<?php
$user = $_GET['username'];
$pass = $_GET['password'];
$query = "SELECT * FROM users WHERE username='$user' AND password='$pass'";
$result = mysqli_query($conn, $query);`,
  },
  {
    lang: 'php',
    code: `<?php
echo "<p>Hello " . $_GET['name'] . "</p>";`,
  },
  {
    lang: 'php',
    code: `<?php
$password = md5($_POST['password']);
$stored = md5("admin123");
if ($password === $stored) {
    $_SESSION['admin'] = true;
}`,
  },
  {
    lang: 'php',
    code: `<?php
error_reporting(0);
@include($_GET['page'] . '.php');`,
  },

  // Ruby
  {
    lang: 'ruby',
    code: `def calculate(a, b, op)
  eval("#{a} #{op} #{b}")
end`,
  },
  {
    lang: 'ruby',
    code: `User.all.each do |user|
  puts user.orders.count
end`,
  },
  {
    lang: 'ruby',
    code: `def send_welcome_email(user)
  # TODO: implement
end

def send_reset_email(user)
  # TODO: implement
end

def send_promo_email(user)
  # TODO: implement
end`,
  },
  {
    lang: 'ruby',
    code: `rescue Exception => e
  nil`,
  },

  // Go
  {
    lang: 'go',
    code: `func divide(a, b int) int {
	return a / b // panics when b == 0
}`,
  },
  {
    lang: 'go',
    code: `result, _ := doSomething()
process(result)`,
  },
  {
    lang: 'go',
    code: `var globalMutex sync.Mutex
var globalCounter int

func increment() {
	globalCounter++ // no lock
}`,
  },
  {
    lang: 'go',
    code: `func getUsers(db *sql.DB) {
	rows, _ := db.Query("SELECT * FROM users")
	// forgot rows.Close()
	for rows.Next() {
		// ...
	}
}`,
  },

  // Rust
  {
    lang: 'rust',
    code: `fn main() {
    let v: Vec<i32> = vec![1, 2, 3];
    let x = v[99]; // panics at runtime
    println!("{}", x);
}`,
  },
  {
    lang: 'rust',
    code: `use std::sync::Mutex;

static DATA: Mutex<Vec<String>> = Mutex::new(vec![]);

fn add(s: String) {
    DATA.lock().unwrap().push(s); // unwrap in library code
}`,
  },
  {
    lang: 'rust',
    code: `fn parse_number(s: &str) -> i32 {
    s.parse().unwrap() // panics on invalid input
}`,
  },

  // Kotlin
  {
    lang: 'kotlin',
    code: `fun getLength(s: String?): Int {
    return s!!.length // force unwrap
}`,
  },
  {
    lang: 'kotlin',
    code: `val list = mutableListOf<String>()

fun addItem(item: String) {
    Thread { list.add(item) }.start() // not thread-safe
}`,
  },
  {
    lang: 'kotlin',
    code: `fun isTrue(b: Boolean): Boolean {
    if (b == true) {
        return true
    } else {
        return false
    }
}`,
  },

  // Swift
  {
    lang: 'swift',
    code: `let url = URL(string: "https://api.example.com")!
let data = try! Data(contentsOf: url)`,
  },
  {
    lang: 'swift',
    code: `class ViewController: UIViewController {
    var timer: Timer?
    override func viewDidLoad() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            self.updateUI() // retain cycle
        }
    }
}`,
  },
  {
    lang: 'swift',
    code: `func fetchUser(id: Int) -> User? {
    return try? db.fetch(User.self, id: id) ?? nil ?? nil ?? nil
}`,
  },

  // HTML
  {
    lang: 'html',
    code: `<!DOCTYPE html>
<html>
<body>
<center>
  <font size="7" color="red">Welcome to my website!!!</font>
  <br><br><br>
  <marquee>Under construction 🚧</marquee>
</center>
</body>
</html>`,
  },
  {
    lang: 'html',
    code: `<div class="div1">
  <div class="div2">
    <div class="div3">
      <div class="div4">
        <div class="div5">
          <p>Hello</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    lang: 'html',
    code: `<button onclick="document.getElementById('modal').style.display='block'; document.getElementById('overlay').style.display='block'; document.getElementById('counter').innerHTML=parseInt(document.getElementById('counter').innerHTML)+1;">Click me</button>`,
  },

  // CSS
  {
    lang: 'css',
    code: `.button {
  position: absolute !important;
  top: 50% !important;
  left: 50% !important;
  margin-top: -25px !important;
  margin-left: -50px !important;
  z-index: 99999 !important;
}`,
  },
  {
    lang: 'css',
    code: `* {
  box-sizing: border-box !important;
  margin: 0 !important;
  padding: 0 !important;
  font-family: Arial !important;
  color: black !important;
}`,
  },
  {
    lang: 'css',
    code: `.container { width: 1200px; }
@media (max-width: 1199px) { .container { width: 1200px; } }
@media (max-width: 768px) { .container { width: 1200px; } }`,
  },

  // SQL
  {
    lang: 'sql',
    code: `SELECT * FROM users, orders, products, categories, reviews
WHERE 1=1
-- TODO: add proper JOINs and authentication`,
  },
  {
    lang: 'sql',
    code: `UPDATE users SET password = '123456' WHERE 1=1;`,
  },
  {
    lang: 'sql',
    code: `SELECT *
FROM orders o, users u, products p, inventory i, shipments s
WHERE o.user_id = u.id
AND o.product_id = p.id
AND p.id = i.product_id
AND s.order_id = o.id
AND u.country = 'BR'
AND p.price > 0
ORDER BY o.created_at DESC;`,
  },
  {
    lang: 'sql',
    code: `CREATE TABLE data (
  id INT,
  col1 VARCHAR(255),
  col2 VARCHAR(255),
  col3 VARCHAR(255),
  col4 VARCHAR(255),
  misc TEXT
);`,
  },

  // Bash
  {
    lang: 'bash',
    code: `#!/bin/bash
rm -rf / --no-preserve-root
echo "cleanup done"`,
  },
  {
    lang: 'bash',
    code: `#!/bin/bash
PASSWORD="supersecret123"
curl -u admin:$PASSWORD https://api.example.com/data`,
  },
  {
    lang: 'bash',
    code: `#!/bin/bash
for file in $(ls *.txt); do
  cat $file >> output.txt
done`,
  },
  {
    lang: 'bash',
    code: `#!/bin/bash
chmod 777 /var/www/html
chmod 777 /etc/passwd
chmod 777 /home`,
  },

  // Dockerfile
  {
    lang: 'dockerfile',
    code: `FROM ubuntu:latest
RUN apt-get update && apt-get install -y everything
COPY . /app
RUN chmod 777 /app
USER root
CMD ["./start.sh"]`,
  },
  {
    lang: 'dockerfile',
    code: `FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
ENV DB_PASSWORD=admin123
ENV SECRET_KEY=mysecretkey
CMD ["node", "index.js"]`,
  },
  {
    lang: 'dockerfile',
    code: `FROM python:3.11
RUN pip install flask
RUN pip install sqlalchemy
RUN pip install requests
RUN pip install numpy
RUN pip install pandas
COPY app.py .
CMD ["python", "app.py"]`,
  },

  // YAML
  {
    lang: 'yaml',
    code: `apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      privileged: true
      runAsUser: 0
    env:
    - name: DB_PASSWORD
      value: "admin123"`,
  },
  {
    lang: 'yaml',
    code: `version: '3'
services:
  db:
    image: postgres
    environment:
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"  # exposed to the internet`,
  },
  {
    lang: 'yaml',
    code: `name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "\${{ github.event.head_commit.message }}" | bash`,
  },
]

async function generateRoasts() {
  const startTime = Date.now()

  try {
    console.log('🌱 Começando seed de 100 roasts...\n')

    const submissionIds: string[] = []

    for (let i = 0; i < 100; i++) {
      const snippet = faker.helpers.arrayElement(SNIPPETS)
      const roastMode = faker.helpers.arrayElement(ROAST_MODES)
      const score = parseFloat((Math.random() * 10).toFixed(1))
      const codePreview = snippet.code.replace(/\s+/g, ' ').slice(0, 160)

      const roastText = faker.helpers.arrayElement(ROAST_TEXTS)

      const result = await db
        .insert(submissions)
        .values({
          code: snippet.code,
          codePreview,
          lang: snippet.lang,
          roastMode,
          score: score.toString(),
          roastText,
          isPublic: faker.datatype.boolean({ probability: 0.8 }),
          createdAt: faker.date.past({ years: 1 }),
        })
        .returning({ id: submissions.id })

      submissionIds.push(result[0].id)
    }

    console.log('✓ 100 roasts inseridos\n')

    let totalFindings = 0

    for (const submissionId of submissionIds) {
      const findingsCount = faker.number.int({ min: 1, max: 3 })

      for (let j = 0; j < findingsCount; j++) {
        const severity = faker.helpers.arrayElement(SEVERITIES)
        const title = faker.helpers.arrayElement(ROAST_TITLES)
        const description = faker.helpers.arrayElement(ROAST_DESCRIPTIONS)

        await db.insert(analysisFindings).values({
          submissionId,
          severity,
          title,
          description,
          sortOrder: j,
        })

        totalFindings++
      }
    }

    console.log(`✓ ${totalFindings} findings inseridos\n`)

    const elapsed = Date.now() - startTime

    console.log('✅ Seed completo!')
    console.log(
      `   - 100 roasts em ${new Set(SNIPPETS.map((s) => s.lang)).size} linguagens`,
    )
    console.log(
      `   - ${totalFindings} findings (média de ${(totalFindings / 100).toFixed(1)} por roast)`,
    )
    console.log(`   - Tempo: ${elapsed}ms\n`)
  } catch (error) {
    console.error('❌ Erro durante seed:', error)
    process.exit(1)
  }
}

generateRoasts()
