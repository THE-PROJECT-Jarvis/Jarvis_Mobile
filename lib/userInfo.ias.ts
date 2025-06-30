import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    margin: 4,
    marginRight: 1,
    backgroundColor: "#333",
  },
  card: {
    backgroundColor: "#222",
    marginBottom: 20,
    borderRadius: 0,
  },
  inputContainer: {
    width: "100%",
    padding: 0,
    margin: 0,
    color: "grey",
  },
  questionContainer: {
    flexDirection: "column",
    gap: 10,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "#1e1e1e",
    borderWidth: 0,
    height: 40,
    padding: 10,
    color: "grey",
  },
  GenerateContainer: {
    width: "100%",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginBottom: 10,
  },
  GenerateButton: {
    backgroundColor: "#007AFF",
    borderRadius: 35,
    position: "fixed",
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  SaveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: "#333",
    borderRadius: 35,
    position: "fixed",
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  labelText: {
    color: "white",
    marginTop: 15,
    marginBottom: 10,
  },
});
export enum InputType {
  Text = "text",
  Number = "number",
  Select = "select",
}

export type IQuestion =
  | {
      label: string;
      param: string;
      input: InputType.Select;
      options: IOptions[]; // required when input is Select
    }
  | {
      label: string;
      param: string;
      input: InputType.Text | InputType.Number;
      options?: never; // not allowed for other input types
    };
export interface IOptions {
  key: string;
  value: string;
}

export interface ICategory {
  label: string;
  questions: IQuestion[];
}

export const categories: ICategory[] = [
  {
    label: "Fitness",
    questions: [
      {
        label: "What is your height (in cm)?",
        input: InputType.Number,
        param: "height",
      },
      {
        label: "What is your current weight (in kg)?",
        input: InputType.Number,
        param: "weight",
      },
      {
        label: "What is your goal? (e.g., lose fat, build muscle)",
        input: InputType.Select,
        param: "goal",
        options: [
          { key: "Fat loss", value: "fat loss" },
          { key: "Muscle Building", value: "muscle building" },
          { key: "Lean Bulk", value: "lean bulk" },
          { key: "Weight Loss", value: "weight loss" },
        ],
      },
      {
        label: "What type of workouts do you prefer?",
        input: InputType.Select,
        param: "workout_type",
        options: [
          { key: "Gym", value: "gym" },
          { key: "Home", value: "home" },
          { key: "Calisthenics", value: "calisthenics" },
          { key: "Yoga", value: "yoga" },
        ],
      },
      {
        label: "How many days a week do you work out?",
        input: InputType.Number,
        param: "workout_days",
      },
      {
        label: "What time of the day do you prefer to work out?",
        input: InputType.Select,
        param: "workout_time",
        options: [
          { key: "Morning", value: "morning" },
          { key: "Afternoon", value: "afternoon" },
          { key: "Evening", value: "evening" },
          { key: "Night", value: "night" },
        ],
      },
      {
        label: "Do you follow any specific diet?",
        input: InputType.Text,
        param: "diet",
      },
    ],
  },
  {
    label: "Mental Health",
    questions: [
      {
        label: "How would you rate your current stress level?",
        input: InputType.Select,
        param: "stress_level",
        options: [
          { key: "Low", value: "low" },
          { key: "Moderate", value: "moderate" },
          { key: "High", value: "high" },
        ],
      },
      {
        label: "Do you practice mindfulness or meditation?",
        input: InputType.Select,
        param: "mindfulness",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
          { key: "Sometimes", value: "sometimes" },
        ],
      },
      {
        label: "Do you face difficulty sleeping?",
        input: InputType.Select,
        param: "sleep_difficulty",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
          { key: "Sometimes", value: "sometimes" },
        ],
      },
      {
        label: "Would you like daily mental health check-ins?",
        input: InputType.Select,
        param: "daily_checkins",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
        ],
      },
    ],
  },
  {
    label: "Productivity",
    questions: [
      {
        label: "What are your biggest time-wasters?",
        input: InputType.Text,
        param: "time_wasters",
      },
      {
        label: "What do you want to achieve daily?",
        input: InputType.Text,
        param: "daily_goals",
      },
      {
        label: "Do you follow a daily schedule?",
        input: InputType.Select,
        param: "daily_schedule",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
        ],
      },
      {
        label: "How many hours do you work/study per day?",
        input: InputType.Number,
        param: "work_hours",
      },
    ],
  },
  {
    label: "Career",
    questions: [
      {
        label: "What is your current career goal?",
        input: InputType.Text,
        param: "career_goal",
      },
      {
        label: "Do you want to switch fields?",
        input: InputType.Select,
        param: "switch_field",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
          { key: "Maybe", value: "maybe" },
        ],
      },
      {
        label: "What skill are you currently learning or want to learn?",
        input: InputType.Text,
        param: "current_skill",
      },
    ],
  },
  {
    label: "Habits",
    questions: [
      {
        label: "What habit are you trying to build?",
        input: InputType.Text,
        param: "habit_build",
      },
      {
        label: "What habit are you trying to break?",
        input: InputType.Text,
        param: "habit_break",
      },
      {
        label: "How many days can you commit per week to this habit?",
        input: InputType.Number,
        param: "habit_days",
      },
    ],
  },
  {
    label: "Relationships",
    questions: [
      {
        label:
          "Do you want to improve romantic relationships, friendships, or both?",
        input: InputType.Select,
        param: "relationship_focus",
        options: [
          { key: "Romantic", value: "romantic" },
          { key: "Friendships", value: "friendships" },
          { key: "Both", value: "both" },
        ],
      },
      {
        label: "Do you face issues in communication?",
        input: InputType.Select,
        param: "communication_issues",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
          { key: "Sometimes", value: "sometimes" },
        ],
      },
    ],
  },
  {
    label: "Finances",
    questions: [
      {
        label: "Do you have a monthly budget?",
        input: InputType.Select,
        param: "budget",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
        ],
      },
      {
        label: "What are your top financial goals?",
        input: InputType.Text,
        param: "financial_goals",
      },
      {
        label: "Do you track your expenses?",
        input: InputType.Select,
        param: "expense_tracking",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
        ],
      },
    ],
  },
  {
    label: "Sleep",
    questions: [
      {
        label: "How many hours do you sleep per night on average?",
        input: InputType.Number,
        param: "sleep_hours",
      },
      {
        label: "Do you have trouble falling asleep?",
        input: InputType.Select,
        param: "trouble_sleeping",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
          { key: "Sometimes", value: "sometimes" },
        ],
      },
      {
        label: "Do you want help building a sleep routine?",
        input: InputType.Select,
        param: "sleep_routine_help",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
        ],
      },
    ],
  },
  {
    label: "Confidence",
    questions: [
      {
        label: "Do you struggle with self-doubt?",
        input: InputType.Select,
        param: "self_doubt",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
          { key: "Sometimes", value: "sometimes" },
        ],
      },
      {
        label: "What situation affects your confidence the most?",
        input: InputType.Text,
        param: "confidence_trigger",
      },
      {
        label: "Would you like daily affirmations or challenges?",
        input: InputType.Select,
        param: "affirmation_opt_in",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
        ],
      },
    ],
  },
  {
    label: "Spiritual Growth",
    questions: [
      {
        label: "Do you follow any spiritual or religious practices?",
        input: InputType.Text,
        param: "spiritual_practice",
      },
      {
        label: "Do you want guidance on spiritual practices?",
        input: InputType.Select,
        param: "spiritual_guidance",
        options: [
          { key: "Yes", value: "yes" },
          { key: "No", value: "no" },
          { key: "Maybe", value: "maybe" },
        ],
      },
    ],
  },
];
