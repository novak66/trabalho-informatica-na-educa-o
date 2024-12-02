<script setup></script>

<template>
  <div
    class="flex justify-center items-center"
    style="width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7)"
  >
    <div
      class="p-10"
      style="
        width: 250px;
        height: 250px;
        background-color: rgba(255, 255, 255, 0.85);
      "
      v-if="score.length === 0"
    >
      <p
        class="cursor-pointer text-center mb-5"
        style="border: 1px solid rgba(0, 0, 0, 0.2); border-radius: 10px"
        @click="$router.push({ name: 'game' })"
      >
        Começar novo jogo
      </p>
      <p
        class="cursor-pointer text-center"
        style="border: 1px solid rgba(0, 0, 0, 0.2); border-radius: 10px"
        @click="getScore"
      >
        Score
      </p>
    </div>
    <table style="width: 80%; border-collapse: collapse" v-else>
      <thead>
        <tr style="background-color: #3498db; color: white; text-align: left">
          <th style="padding: 10px; border: 1px solid #ddd">Nome</th>
          <th style="padding: 10px; border: 1px solid #ddd">Score</th>
          <th style="padding: 10px; border: 1px solid #ddd">Tempo</th>
          <th style="padding: 10px; border: 1px solid #ddd">dificuldade</th>
          <p
            class="cursor-pointer"
            style="position: absolute; margin-left: -19px"
            @click="score = []"
          >
            X
          </p>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in score"
          :key="index"
          style="background-color: #f9f9f9; text-align: left"
        >
          <td style="padding: 10px; border: 1px solid #ddd">{{ item[0] }}</td>
          <td style="padding: 10px; border: 1px solid #ddd">{{ item[1] }}</td>
          <td style="padding: 10px; border: 1px solid #ddd">{{ item[2] }}</td>
          <td style="padding: 10px; border: 1px solid #ddd">
            {{ item[3] === 0 ? "Fácil" : item[3] === 1 ? "Médio" : "Difícil" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import initSqlJs from "sql.js";
import { perguntas } from "@/components/perguntas";
export default {
  data() {
    return {
      db: null,
      score: [],
    };
  },

  name: "Jogo",

  async created() {
    await this.carregarBanco();

    this.db.run(`
      CREATE TABLE IF NOT EXISTS score (
          nomeJogador TEXT,
          score INTEGER,
          tempo INTEGER ,
          dificuldade INTEGER
      );
  `);

    await this.inicializarPerguntas();

    this.salvarBanco();
  },

  methods: {
    async carregarBanco() {
      const SQL = await initSqlJs({
        locateFile: (file) => `node_modules/sql.js/dist/${file}`,
      });

      const base64Data = localStorage.getItem("meuBanco");

      if (base64Data) {
        const data = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        this.db = new SQL.Database(data);
        console.log("Banco carregado com sucesso!");
      } else {
        console.log("Nenhum banco encontrado, criando novo.");
        this.db = new SQL.Database();
      }
    },

    getScore() {
      const result = this.db.exec(
        "SELECT * FROM score order by -score limit 5"
      );

      this.score = result[0].values;
    },

    salvarBanco() {
      if (!this.db) {
        console.error("Banco não inicializado.");
        return;
      }

      const data = this.db.export();

      const base64Data = btoa(String.fromCharCode(...new Uint8Array(data)));
      localStorage.setItem("meuBanco", base64Data);

      console.log("Banco salvo no LocalStorage!");
    },

    async inicializarPerguntas() {
      try {
        await this.db.run(`
            CREATE TABLE IF NOT EXISTS cards (
                id INTEGER PRIMARY KEY,
                grupoId INTEGER,
                text TEXT,
                virado BOOLEAN
            );
        `);

        const countResult = await this.db.exec(
          `SELECT COUNT(*) AS count FROM cards`
        );

        if (countResult[0]?.values[0][0] === 0) {
          const insertStmt = `
                INSERT INTO cards (id, grupoId, text, virado)
                VALUES (?, ?, ?, ?);
            `;
          for (const { id, grupoId, text, virado } of perguntas) {
            await this.db.run(insertStmt, [id, grupoId, text, virado]);
          }

          console.log("Dados inseridos na tabela.");
        } else {
          console.log("A tabela já contém dados. Nenhuma inserção necessária.");
        }
      } catch (error) {
        console.error("Erro ao inicializar perguntas:", error);
      }
    },
  },
};
</script>

<style></style>
