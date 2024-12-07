"use client";
import { useForm, zodResolver } from "@mantine/form";
import { z } from "zod";
import {
  TextInput,
  Group,
  Button,
  Box,
  Paper,
  Title,
  Stack,
  SimpleGrid,
  Select,
  Textarea,
  NumberInput,
} from "@mantine/core";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconMapPin2,
  IconLoader2,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { usePageNotifications } from "@/lib/hooks/useNotifications";
import { useMutation } from "@tanstack/react-query";
import callApi from "@/services/apiService";
import { indianStates } from "@/lib/constants";
import { useState } from "react";

// Define the validation schema using zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number"),
});

const ReviewStoreForm = () => {
  const router = useRouter();
  const notification = usePageNotifications();
  const form = useForm({
    validate: zodResolver(formSchema),
    initialValues: {
      name: "",
      category: null,
      address: "",
      city: "",
      pincode: "",
      state: "",
      email: "",
      phoneNumber: "",
      latitude: "",
      longitude: "",
    },
  });

  const createMerchant = useMutation({
    mutationFn: () => callApi.post(`/v1/merchants`, form.values),
    onSuccess: async (res) => {
      const { data } = res;

      router.push(`/stores/add?merchantId=${data?.data?.id}`);
      notification.success(`Merchant created successfully`);
    },
    onError: (err: Error) => {
      notification.error(`${err}`);
      console.log(err.message);
    },
  });

  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      notification.error("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        form.setFieldValue("latitude", latitude.toFixed(6));
        form.setFieldValue("longitude", longitude.toFixed(6));

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}`
          );
          const data = await response.json();

          if (data.results && data.results[0]) {
            const addressComponents = data.results[0].address_components;
            let state = "";
            let city = "";
            let fullAddress = data.results[0].formatted_address;

            addressComponents.forEach((component) => {
              if (component.types.includes("administrative_area_level_1")) {
                state = component.long_name;
              }
              if (component.types.includes("locality")) {
                city = component.long_name;
              }
            });

            notification.success("Location detected successfully");
          }
        } catch (error) {
          console.error("Error getting address:", error);
          notification.error("Failed to get address details");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        notification.error(error.message || "Failed to get your location");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return (
    <form
      onSubmit={form.onSubmit(() => {
        createMerchant.mutate();
      })}
    >
      <SimpleGrid cols={2} spacing="md">
        <TextInput
          label="Email"
          placeholder="your@email.com"
          //   leftSection={<IconMail size="1rem" />}
          {...form.getInputProps("email")}
          withAsterisk
        />

        <TextInput
          label="Phone Number"
          placeholder="+1234567890"
          //   leftSection={<IconPhone size="1rem" />}
          {...form.getInputProps("phoneNumber")}
          withAsterisk
        />
        <TextInput
          label="Store Name"
          placeholder="Enter store name"
          //   leftSection={<IconUser size="1rem" />}
          {...form.getInputProps("name")}
          withAsterisk
        />

        <Select
          label="Category"
          placeholder="Select store category"
          data={[
            { value: "1", label: "Restaurant" },
            { value: "2", label: "Retail" },
            { value: "3", label: "Grocery" },
            { value: "4", label: "Electronics" },
            { value: "5", label: "Fashion" },
          ]}
          // {...form.getInputProps("categoryId")}
          withAsterisk
        />

        <Textarea
          label="Address"
          placeholder="Enter complete address"
          minRows={2}
          //   leftSection={<IconMapPin size="1rem" />}
          {...form.getInputProps("address")}
          withAsterisk
        />

        <TextInput
          label="City"
          placeholder="Enter city name"
          //   leftSection={<IconMapPin2 size="1rem" />}
          {...form.getInputProps("city")}
          withAsterisk
        />
        <NumberInput
          label="Pincode"
          placeholder="Enter pincode"
          //   leftSection={<IconMapPin2 size="1rem" />}
          {...form.getInputProps("pincode")}
          withAsterisk
          allowDecimal={false}
          hideControls
        />

        <Select
          label="State"
          placeholder="Select state"
          data={indianStates}
          //   leftSection={<IconMapPin size="1rem" />}
          {...form.getInputProps("state")}
          withAsterisk
          searchable
        />

        <Group grow align="flex-end">
          <TextInput
            label="Latitude"
            placeholder="Enter latitude"
            // leftSection={<IconMapPin2 size="1rem" />}
            {...form.getInputProps("latitude")}
            readOnly
          />
          <TextInput
            label="Longitude"
            placeholder="Enter longitude"
            // leftSection={<IconMapPin2 size="1rem" />}
            {...form.getInputProps("longitude")}
            readOnly
          />
          <Button
            onClick={getCurrentLocation}
            disabled={loading}
            leftSection={
              loading ? (
                <IconLoader2 className="animate-spin" size="1rem" />
              ) : (
                <IconMapPin2 size="1rem" />
              )
            }
          >
            {loading ? "Detecting..." : "Get Location"}
          </Button>
        </Group>
      </SimpleGrid>

      <Group mt="md">
        <Button type="submit" w={200} loading={createMerchant.isPending}>
          Create
        </Button>
      </Group>
    </form>
  );
};

export default ReviewStoreForm;