import { getToken } from "@/utils/token";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text, TextInput } from "react-native";
import { Button, Card, List } from "react-native-paper";
import Toast from "react-native-toast-message";
import { ICategory, styles } from "../../lib/userInfo.ias";
import QuestionInput from "./questionInput.component";

const QuestionCard = ({ category }: { category: ICategory }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setSaved(false);
    try {
      const token = await getToken("jwt");
      if (!token) throw new Error("Token not found");

      await axios.post(
        `https://jarvisbackend-production.up.railway.app/api/user-data/${category.label.toLowerCase()}`,
        {
          params: data,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSaved(true);
      Toast.show({
        type: "success",
        text1: "Saved successfully",
      });
      setExpanded(false);
    } catch (error: any) {
      console.error("API Error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to save",
        text2: error?.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDirty) {
      setSaved(false);
    }
  }, [watch()]);

  return (
    <List.Accordion
      title={category.label}
      titleStyle={{
        color: "white",
        fontSize: 25,
      }}
      expanded={expanded}
      onPress={() => setExpanded(!expanded)}
      style={{ backgroundColor: "#222" }}
    >
      <Card style={styles.card}>
        <Card.Content>
          {category.questions.map((ques, idx) => (
            <QuestionInput key={idx} question={ques} control={control} />
          ))}

          <Text style={styles.labelText}>Want to tell more ?</Text>
          <Controller
            name="extraInstruction"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                style={styles.input}
                placeholder="Additional instruction you want to pass"
                placeholderTextColor={"grey"}
              />
            )}
          />

          <Button
            mode="contained"
            style={styles.SaveButton}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || loading}
            textColor="white"
          >
            {loading ? "Saving..........." : saved ? "Saved" : "Save"}
          </Button>
        </Card.Content>
      </Card>
    </List.Accordion>
  );
};

export default QuestionCard;
